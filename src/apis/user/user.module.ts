import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entites/user.entity';
import { Address } from 'src/entites/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])], // 순환 참조 처리
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
