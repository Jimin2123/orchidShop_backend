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
import { UpdateUserDto } from 'src/common/dtos/user/updateUser.dto';
import { LocalAccount } from 'src/entites/local-account.entity';
import { hashPassword } from 'src/common/utils/hash.util';
import { runInTransaction } from 'src/common/utils/transcation.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly dataSource: DataSource
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

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await runInTransaction(this.dataSource, async (queryRunner: QueryRunner) => {
      const userRepository = queryRunner.manager.getRepository(User);
      const addressRepository = queryRunner.manager.getRepository(Address);
      const localAccountRepository = queryRunner.manager.getRepository(LocalAccount);

      // 사용자 조회
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['addresses', 'localAccount'],
      });

      if (!user) {
        throw new NotFoundException(`사용자(${userId})를 찾을 수 없습니다.`);
      }

      // 사용자 기본 정보 업데이트
      Object.assign(user, updateUserDto);

      // 주소 업데이트
      if (updateUserDto.addresses) {
        const addressesToSave = [];
        for (const addressDto of updateUserDto.addresses) {
          if (addressDto.id) {
            // 기존 주소 업데이트
            const address = await addressRepository.findOne({ where: { id: addressDto.id } });
            if (!address) continue;
            Object.assign(address, { ...addressDto, user }); // 관계 명시
            addressesToSave.push(address);
          } else {
            // 새로운 주소 추가
            const newAddress = addressRepository.create({ ...addressDto, user }); // 관계 명시
            addressesToSave.push(newAddress);
          }
        }

        if (addressesToSave.length > 0) {
          await addressRepository.save(addressesToSave);
        }
      }

      // 계정 정보 업데이트
      if (updateUserDto.localAccount) {
        if (!user.localAccount) {
          throw new NotFoundException(`사용자(${userId})의 로컬 계정을 찾을 수 없습니다.`);
        }

        if (updateUserDto.localAccount.password) {
          user.localAccount.password = await hashPassword(updateUserDto.localAccount.password);
        }

        Object.assign(user.localAccount, updateUserDto.localAccount);
        await localAccountRepository.save(user.localAccount);
      }

      // 최종 사용자 업데이트
      return await userRepository.save(user);
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
