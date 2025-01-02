import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from 'src/common/dtos/user/createAddress.dto';
import { CreateUserDto } from 'src/common/dtos/user/createUser.dto';
import { Address } from 'src/entites/address.entity';
import { User } from 'src/entites/user.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import * as fs from 'fs';
import { SocialRequest } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { randomUUID } from 'crypto';
import { UpdateUserWithDTOs } from 'src/common/dtos/user/updateUser.dto';
import { LocalAccount } from 'src/entites/local-account.entity';
import { hashPassword } from 'src/common/utils/hash.util';
import { UpdateAddressDto } from 'src/common/dtos/user/updateAddress.dto';
import { CustomWinstonLogger } from 'src/logger/logger.service';
import { GetMethodName } from 'src/common/decorators/get-mehtod-name.decorator';
import { TransactionUtil } from 'src/common/utils/transcation.util';

@Injectable()
export class UserService {
  private readonly contextName = UserService.name;
  private methodName: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly dataSource: DataSource,
    private readonly transactionUtil: TransactionUtil,
    private readonly logger: CustomWinstonLogger
  ) {}

  createUser(createUserDto: CreateUserDto): User {
    return this.userRepository.create(createUserDto);
  }

  createSocialUser(socialUser: SocialRequest): User {
    const { name, profile_image } = socialUser.user;
    const createdUser = this.userRepository.create({
      name,
      profileImage: profile_image,
      nickName: randomUUID(),
      isActive: false,
    });

    return createdUser;
  }

  createAddress(user: User, addressDto: CreateAddressDto): Address {
    return this.addressRepository.create({ ...addressDto, user: user });
  }

  @GetMethodName()
  async updateUser(userId: string, updateUserDto: UpdateUserWithDTOs): Promise<User> {
    return await this.transactionUtil.runInTransaction(this.dataSource, async (queryRunner: QueryRunner) => {
      this.logger.log(`트랜잭션 활성화`, this.methodName);
      const userRepository = queryRunner.manager.getRepository(User);
      const addressRepository = queryRunner.manager.getRepository(Address);
      const localAccountRepository = queryRunner.manager.getRepository(LocalAccount);

      // 사용자 조회 및 관계 로드
      let user = await userRepository.findOne({
        where: { id: userId },
        relations: ['addresses', 'localAccount'],
      });

      if (!user) {
        this.logger.error(`사용자(${userId})를 찾을 수 없습니다.`, this.methodName);
        throw new NotFoundException(`사용자(${userId})를 찾을 수 없습니다.`);
      }

      // 사용자 정보 업데이트 (먼저 수행)
      if (updateUserDto.user) {
        this.logger.log(`사용자 정보 업데이트 활성화`, this.methodName);
        Object.assign(user, updateUserDto.user);
        await userRepository.save(user);

        this.logger.log(`사용자 정보 업데이트 완료`, this.methodName);
        // 사용자 정보를 다시 로드
        user = await userRepository.findOne({
          where: { id: userId },
          relations: ['addresses', 'localAccount'],
        });
      }

      // 주소 업데이트
      if (updateUserDto.addresses) {
        this.logger.log(`주소 업데이트 활성화 `, this.methodName);
        const addressesToUpdate = updateUserDto.addresses.filter((addr) => addr.id) as UpdateAddressDto[];
        const addressesToCreate = updateUserDto.addresses.filter((addr) => !addr.id) as CreateAddressDto[];

        // 기존 주소 업데이트
        for (const addressDto of addressesToUpdate) {
          const existingAddress = await addressRepository.findOne({ where: { id: addressDto.id } });
          if (existingAddress) {
            this.logger.log(`기존 주소 업데이트: ${addressDto.id}`, this.methodName);
            Object.assign(existingAddress, { ...addressDto, user: user });
            await addressRepository.save(existingAddress);
            this.logger.log(`주소 업데이트 완료: ${addressDto.id}`, this.methodName);
          }
        }

        // 새로운 주소 추가
        if (addressesToCreate.length > 0) {
          try {
            this.logger.log(`새로운 주소 추가: ${addressesToCreate.map((addr) => addr)}`, this.methodName);
            const newAddresses = addressesToCreate.map((addr) => addressRepository.create({ ...addr, user: user }));
            await addressRepository.save(newAddresses);
            this.logger.log(`새로운 주소 추가 완료: ${newAddresses.map((addr) => addr.id)}`, this.methodName);
          } catch (e) {
            this.logger.error(`주소 추가 중 오류 발생: ${e.message}`, this.methodName);
            throw Error(`주소 추가 중 오류 발생: ${e.message}`);
          }
        }
        this.logger.log(`주소 업데이트 완료`, this.methodName);
      }

      // 로컬 계정 업데이트
      if (updateUserDto.localAccount) {
        this.logger.log(`로컬 계정 업데이트 활성화`, this.methodName);
        if (!user.localAccount) {
          this.logger.error(`사용자(${userId})의 로컬 계정을 찾을 수 없습니다.`, this.methodName);
          throw new NotFoundException(`사용자(${userId})의 로컬 계정을 찾을 수 없습니다.`);
        }

        if (updateUserDto.localAccount.password) {
          this.logger.log(`비밀번호 해싱`, this.methodName);
          user.localAccount.password = await hashPassword(updateUserDto.localAccount.password);
        }

        Object.assign(user.localAccount, updateUserDto.localAccount);
        await localAccountRepository.save(user.localAccount);
        this.logger.log(`로컬 계정 업데이트 완료`, this.methodName);
      }

      return user;
    });
  }

  async updateProfileImage(userId: string, imagePath: string) {
    // 1. 기존 사용자 정보 조회
    const user = await this.findUserById(userId);

    // 2. 기존 이미지 삭제
    if (user.profileImage) {
      const filePath = user.profileImage;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // 파일 삭제
      }
    }

    // 3. 새로운 이미지 경로 저장
    await this.userRepository.update({ id: userId }, { profileImage: imagePath });
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['addresses', 'localAccount'] });
    delete user.localAccount.password;

    if (!user) {
      throw new NotFoundException(`사용자(${userId})를 찾을 수 없습니다.`);
    }
    return user;
  }

  async findUserByNickName(nickName: string): Promise<User> {
    return await this.userRepository.findOne({ where: { nickName } });
  }

  async findUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
