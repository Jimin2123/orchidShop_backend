import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalAccount } from 'src/entites/local-account.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { RefreshToken } from 'src/entites/refresh-token.entity';
import { hashPassword } from 'src/common/utils/hash.util';
import { runInTransaction } from 'src/common/utils/transcation.util';
import { SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { User } from 'src/entites/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(LocalAccount)
    private readonly localAccountRepository: Repository<LocalAccount>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource
  ) {}

  async register(SignUpDto: SignUpDto): Promise<User> {
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
}
