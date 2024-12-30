import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalAccount } from 'src/entites/local-account.entity';
import { DataSource, MoreThan, QueryRunner, Repository } from 'typeorm';
import { RefreshToken } from 'src/entites/refresh-token.entity';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
import { runInTransaction } from 'src/common/utils/transcation.util';
import { LocalAccountDto, SignUpDto, SocialRequest } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { User } from 'src/entites/user.entity';
import { TokenPayload, Tokens, TokenService } from './token.service';
import { SocialAccount } from 'src/entites/social-account.entity';
import { Address } from 'src/entites/address.entity';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7일 (환경변수로 관리 가능)
  constructor(
    @InjectRepository(LocalAccount)
    private readonly localAccountRepository: Repository<LocalAccount>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(SocialAccount)
    private readonly socialAccountRepository: Repository<SocialAccount>,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource
  ) {}

  async signup(signUpDto: SignUpDto): Promise<User> {
    const { localAccount, address, user } = signUpDto;
    const { email, password } = localAccount;

    // 이메일 중복 확인
    const existingEmail = await this.localAccountRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    // 닉네임 중복 확인
    const existingUser = await this.userService.findUserByNickName(user.nickName);
    if (existingUser) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 트랜잭션 실행
    const savedUser = await runInTransaction(this.dataSource, async (queryRunner) => {
      const userRepository = queryRunner.manager.getRepository(User);
      const addressRepository = queryRunner.manager.getRepository(Address);
      const localAccountRepository = queryRunner.manager.getRepository(LocalAccount);

      // 사용자 생성
      const createdUser = userRepository.create(user);
      const savedUser = await userRepository.save(createdUser);

      // 로컬 계정 생성
      const createdLocalAccount = localAccountRepository.create({
        email,
        password: hashedPassword,
        user: savedUser,
      });
      await localAccountRepository.save(createdLocalAccount);

      // 주소 생성
      const createdAddress = addressRepository.create({ user: savedUser, ...address });
      await addressRepository.save(createdAddress);

      return savedUser;
    });

    // 사용자 조회 및 반환
    return await this.userService.findUserById(savedUser.id);
  }

  async login(localAccount: LocalAccountDto): Promise<Tokens> {
    const { email, password } = localAccount;

    // LocalAccount 엔티티에서 이메일로 계정 검색
    const account = await this.localAccountRepository.findOne({
      where: { email },
      relations: ['user'],
    });

    if (!account) {
      throw new BadRequestException('등록되지 않은 이메일입니다.');
    }

    // 계정 잠금 여부 확인 및 처리
    if (account.isLocked && this.isAccountLocked(account)) {
      await this.localAccountRepository.save(account);
      throw new BadRequestException(this.getLockMessage(account));
    }

    // 패스워드 검증
    const isPasswordValid = await comparePassword(password, account.password);
    if (!isPasswordValid) {
      // 실패 횟수 증가
      account.loginAttempt += 1;

      // 실패 횟수에 따른 잠금 처리
      if (account.loginAttempt >= 3) {
        account.isLocked = true;
        account.lockedAt = new Date();
      }

      await this.localAccountRepository.save(account);

      if (account.isLocked) {
        throw new BadRequestException(this.getLockMessage(account));
      }

      const remainingAttempts = 3 - account.loginAttempt;
      throw new BadRequestException(`비밀번호가 일치하지 않습니다. 남은 시도 횟수: ${remainingAttempts}`);
    }

    // 로그인 성공 처리
    await this.handleSuccessfulLogin(account);

    // User 엔티티에서 사용자 정보 가져오기
    const user = await this.userService.findUserById(account.user.id);

    if (!user) {
      throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
    }

    // 토큰 생성 및 반환
    return await this.generateTokens(user);
  }

  /**
   * 계정이 잠겨 있는지 확인하고, 잠금이 만료되었으면 잠금을 해제합니다.
   * @param account LocalAccount 계정 정보
   * @returns {boolean} 계정이 잠겨 있는 경우 true, 그렇지 않으면 false
   */
  private isAccountLocked(account: LocalAccount): boolean {
    if (account.isLocked && account.lockedAt) {
      const lockExpiry = this.calculateLockExpiry(account);

      if (new Date() < lockExpiry) {
        return true;
      }

      // 잠금 해제 처리 (loginAttempt 유지)
      account.isLocked = false;
      account.lockedAt = null;
    }
    return false;
  }

  /**
   * 계정이 잠겨 있는 경우 남은 잠금 시간을 포함한 메시지를 반환합니다.
   * @param account LocalAccount 계정 정보
   * @returns {string} 잠금 상태 메시지
   */
  private getLockMessage(account: LocalAccount): string {
    const lockExpiry = this.calculateLockExpiry(account);
    const remainingTime = Math.ceil((lockExpiry.getTime() - new Date().getTime()) / 60000);
    return `계정이 잠겨 있습니다. ${remainingTime}분 후에 다시 시도하세요.`;
  }

  /**
   * 계정 잠금 만료 시간을 계산합니다.
   * @param account LocalAccount 계정 정보
   * @returns {Date} 잠금 만료 시간
   */
  private calculateLockExpiry(account: LocalAccount): Date {
    if (!account.lockedAt) {
      throw new Error('잠금 시간이 설정되지 않았습니다.');
    }
    const lockDurations = [5, 10, 30];
    const duration = lockDurations[Math.min(account.loginAttempt - 3, lockDurations.length - 1)];
    return new Date(account.lockedAt.getTime() + duration * 60 * 1000);
  }

  /**
   * 로그인 성공 시 계정의 시도 횟수를 초기화하고 마지막 로그인 시간을 갱신합니다.
   * @param account LocalAccount 계정 정보
   * @returns {Promise<void>}
   */
  private async handleSuccessfulLogin(account: LocalAccount): Promise<void> {
    account.resetLoginAttempts();
    account.lastLogin = new Date();
    await this.localAccountRepository.save(account);
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

  async logout(userId: string): Promise<void> {
    const checkRefreshToken = await this.refreshTokenRepository.findOne({ where: { user: { id: userId } } });
    if (!checkRefreshToken) {
      throw new BadRequestException('로그아웃할 수 있는 토큰이 없습니다.');
    }
    await this.refreshTokenRepository.delete({ user: { id: userId } });
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

  async socialLogin(req: SocialRequest) {
    const { provider_id } = req.user;

    const existingUser = await this.socialAccountRepository.findOne({
      where: { provider_id, provider: req.user.provider },
      relations: ['user'],
    });

    if (!existingUser) {
      const savedUser = await runInTransaction(this.dataSource, async (queryRunner: QueryRunner) => {
        const createdUser = this.userService.createSocialUser(req);
        const savedUser = await queryRunner.manager.save(createdUser);

        const createdSocialAccount = this.socialAccountRepository.create({ user: createdUser, ...req.user });
        await queryRunner.manager.save(createdSocialAccount);

        return savedUser;
      });
      const token = await this.generateTokens(savedUser);
      return { isNewUser: true, token };
    } else {
      const token = await this.generateTokens(existingUser.user);
      return { isNewUser: !existingUser.user.isActive, token };
    }
  }
}
