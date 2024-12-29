import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from 'src/apis/auth/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization 헤더에서 JWT 추출
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'), // 비밀 키 설정
    });
  }

  async validate(payload: TokenPayload): Promise<string> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
    return payload.sub;
  }
}
