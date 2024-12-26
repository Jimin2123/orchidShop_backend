import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from 'src/common/dtos/user/createAddress.dto';
import { CreateUserDto } from 'src/common/dtos/user/createUser.dto';
import { Address } from 'src/entites/address.entity';
import { User } from 'src/entites/user.entity';
import { Repository } from 'typeorm';

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

  createAddress(user: User, addressDto: CreateAddressDto): Address {
    return this.addressRepository.create({ ...addressDto, user: user });
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
}
