import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalAccount } from 'src/entites/local-account.entity';
import { DataSource, MoreThan, QueryRunner, Repository } from 'typeorm';
import { RefreshToken } from 'src/entites/refresh-token.entity';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
import { runInTransaction } from 'src/common/utils/transcation.util';
import { LocalAccountDto, SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { User } from 'src/entites/user.entity';
import { TokenPayload, Tokens, TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7일 (환경변수로 관리 가능)
  constructor(
    @InjectRepository(LocalAccount)
    private readonly localAccountRepository: Repository<LocalAccount>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource
  ) {}

  async signup(SignUpDto: SignUpDto): Promise<User> {
    const { localAccount, address, user } = SignUpDto;
    const { email, password } = localAccount;

    // 사용 중인 이메일 확인
    const existingEmail = await this.localAccountRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }

    // 사용 중인 닉네임 확인
    const existingUser = await this.userService.findUserByNickName(user.nickName);
    if (existingUser) {
      throw new BadRequestException('이미 사용중인 닉네임입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 트랜잭션 내에서 사용자 생성 및 로컬 계정 생성
    const savedUser = await runInTransaction(this.dataSource, async (queryRunner: QueryRunner) => {
      // 사용자 생성
      const createdUser = this.userService.createUser(user);
      const savedUser = await queryRunner.manager.save(createdUser);

      // 로컬 계정 생성
      const createdLocalAccount = this.localAccountRepository.create({
        email,
        password: hashedPassword,
        user: savedUser,
      });
      await queryRunner.manager.save(createdLocalAccount);

      // 주소 생성
      const createdAddress = this.userService.createAddress(savedUser, address);
      await queryRunner.manager.save(createdAddress);

      return savedUser;
    });

    return await this.userService.findUserById(savedUser.id);
  }

  async login(localAccount: LocalAccountDto): Promise<Tokens> {
    const { email, password } = localAccount;

    // 사용자 확인
    const checkAccount = await this.localAccountRepository.findOne({ where: { email }, relations: ['user'] });
    if (!checkAccount) {
      throw new BadRequestException('등록되지 않은 이메일입니다.');
    }

    // 패스워드 확인
    const isPasswordMatch = await comparePassword(password, checkAccount.password);
    if (!isPasswordMatch) {
      checkAccount.loginAttempt += 1;
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    if (!checkAccount || !isPasswordMatch) {
      throw new BadRequestException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const user = await this.userService.findUserById(checkAccount.user.id);
    const tokens = await this.generateTokens(user);

    checkAccount.loginAttempt = 0;
    await this.localAccountRepository.update({ id: checkAccount.id }, { loginAttempt: 0, lastLogin: new Date() });

    return tokens;
  }

  /**
   * 리프레시 토큰을 이용하여 새로운 액세스 토큰과 리프레시 토큰을 발급합니다.
   * @param refreshToken 사용자가 제공한 리프레시 토큰
   * @returns 새롭게 발급된 액세스 토큰과 리프레시 토큰
   */
  async refreshToken(refreshToken: string): Promise<Tokens> {
    // 1. 리프레시 토큰이 데이터베이스에 존재하고 유효한지 확인
    const existingToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    // 2. 리프레시 토큰이 없거나 만료된 경우 처리
    if (!existingToken || existingToken.expiresAt < new Date()) {
      if (existingToken) {
        await this.refreshTokenRepository.remove(existingToken); // 유효하지 않은 토큰 제거
      }
      throw new BadRequestException('유효하지 않은 리프레시 토큰입니다.');
    }

    // 3. 새로운 액세스 토큰과 리프레시 토큰 생성
    const tokenPayload: TokenPayload = { sub: existingToken.user.id, role: existingToken.user.role };
    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    // 4. 기존 리프레시 토큰을 업데이트
    existingToken.token = newRefreshToken;
    existingToken.expiresAt = new Date(Date.now() + this.refreshTokenExpiry);
    await this.refreshTokenRepository.save(existingToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * 사용자 로그인 시 액세스 토큰과 리프레시 토큰을 생성합니다.
   * @param user 로그인된 사용자
   * @returns 새롭게 생성된 액세스 토큰과 리프레시 토큰
   */
  private async generateTokens(user: User): Promise<Tokens> {
    try {
      // 1. 토큰에 포함할 페이로드 생성
      const tokenPayload: TokenPayload = { sub: user.id, role: user.role };

      // 2. 새로운 액세스 토큰 생성
      const accessToken = this.tokenService.generateAccessToken(tokenPayload);

      // 3. 새로운 리프레시 토큰 생성 또는 기존 토큰 갱신
      const refreshToken = await this.createOrUpdateRefreshToken(user, tokenPayload);

      return { accessToken, refreshToken };
    } catch (e) {
      console.error('토큰 생성 중 에러 발생:', e);
      throw new InternalServerErrorException('토큰 생성 중 문제가 발생했습니다.');
    }
  }

  /**
   * 사용자와 연관된 유효한 리프레시 토큰을 확인합니다.
   * @param user 대상 사용자
   * @returns 사용자와 연관된 유효한 리프레시 토큰
   */
  private async getValidRefreshToken(user: User): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { user: { id: user.id }, expiresAt: MoreThan(new Date()) },
    });
  }

  /**
   * 리프레시 토큰을 생성하거나 기존 토큰을 갱신합니다.
   * @param user 대상 사용자
   * @param payload 토큰 페이로드
   * @returns 새로 생성된 리프레시 토큰
   */
  private async createOrUpdateRefreshToken(user: User, payload: TokenPayload): Promise<string> {
    // 새로운 리프레시 토큰 생성
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    // 데이터베이스에 저장할 리프레시 토큰 정보 생성 또는 업데이트
    let refreshTokenData = await this.getValidRefreshToken(user);
    if (!refreshTokenData) {
      refreshTokenData = this.refreshTokenRepository.create({ user });
    }

    // 토큰과 만료 시간 업데이트
    refreshTokenData.token = refreshToken;
    refreshTokenData.expiresAt = new Date(Date.now() + this.refreshTokenExpiry);

    await this.refreshTokenRepository.save(refreshTokenData);

    return refreshToken;
  }
}
