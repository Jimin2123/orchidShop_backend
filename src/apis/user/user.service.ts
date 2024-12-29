import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from 'src/common/dtos/user/createAddress.dto';
import { CreateUserDto } from 'src/common/dtos/user/createUser.dto';
import { Address } from 'src/entites/address.entity';
import { User } from 'src/entites/user.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { SocialRequest } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
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
