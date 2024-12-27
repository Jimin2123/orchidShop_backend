import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY');
  const expiresIn = configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME');

  if (!secret || !expiresIn) {
    throw new Error('JWT 환경변수가 제대로 설정되지 않았습니다.');
  }

  return {
    secret,
    signOptions: { expiresIn },
  };
};
