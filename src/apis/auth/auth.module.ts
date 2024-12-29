import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalAccount } from 'src/entites/local-account.entity';
import { RefreshToken } from 'src/entites/refresh-token.entity';
import { User } from 'src/entites/user.entity';
import { Address } from 'src/entites/address.entity';
import { TokenService } from './token.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from 'src/configs/jwt.config';
import { JwtStrategy } from 'src/guards/passports/jwt.strategy';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { UserModule } from '../user/user.module';
import { SocialAccount } from 'src/entites/social-account.entity';
import { GoogleStrategy } from 'src/guards/passports/google.strategy';
import { NaverStrategy } from 'src/guards/passports/naver.strategy';
import { KakaoStrategty } from 'src/guards/passports/kakao.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocalAccount, RefreshToken, User, Address, SocialAccount]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    TokenService,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategty,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
