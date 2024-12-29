import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/user.entity';
import { Address } from 'src/entites/address.entity';
import { LocalAccount } from 'src/entites/local-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address, LocalAccount])], // 순환 참조 처리
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
