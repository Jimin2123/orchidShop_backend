import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalAccount } from 'src/entites/local-account.entity';
import { RefreshToken } from 'src/entites/refresh-token.entity';
import { UserService } from '../user/user.service';
import { User } from 'src/entites/user.entity';
import { Address } from 'src/entites/address.entity';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([LocalAccount, RefreshToken, User, Address])],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService, TokenService],
})
export class AuthModule {}
