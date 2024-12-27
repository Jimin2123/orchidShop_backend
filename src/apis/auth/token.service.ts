import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  sub: string; // 사용자 ID
  role: string; // 사용자 역할
  iat?: number;
  exp?: number;
  [key: string]: any; // 확장 가능
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;
  private readonly tokenIssuer: string;
  private readonly tokenAudience: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.accessTokenSecret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY', 'defaultAccessTokenSecret');
    this.refreshTokenSecret = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET_KEY',
      'defaultRefreshTokenSecret'
    );
    this.accessTokenExpiration = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME', '15m');
    this.refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME', '7d');
    this.tokenIssuer = this.configService.get<string>('TOKEN_ISSUER', 'your-default-issuer');
    this.tokenAudience = this.configService.get<string>('TOKEN_AUDIENCE', 'your-default-audience');

    // 중요한 설정 값 검증
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT 비밀 키가 설정되지 않았습니다.');
    }
  }

  /**
   * JWT 토큰 생성
   * @param payload 토큰 페이로드
   * @param secret 비밀 키
   * @param expiresIn 만료 시간
   * @param audience 대상자 (옵션)
   * @returns 생성된 JWT 토큰
   */
  private generateToken(payload: TokenPayload, secret: string, expiresIn: string, audience?: string): string {
    const options: JwtSignOptions = {
      secret,
      expiresIn,
      issuer: this.tokenIssuer,
    };
    if (audience) {
      options.audience = audience;
    }

    const token = this.jwtService.sign(payload, options);
    if (typeof token !== 'string') {
      throw new Error('Token generation failed');
    }
    return token;
  }

  /**
   * 액세스 토큰 생성
   * @param payload 토큰 페이로드
   * @returns 액세스 토큰
   */
  generateAccessToken(payload: TokenPayload): string {
    return this.generateToken(payload, this.accessTokenSecret, this.accessTokenExpiration);
  }

  /**
   * 리프레시 토큰 생성
   * @param payload 토큰 페이로드
   * @returns 리프레시 토큰
   */
  generateRefreshToken(payload: TokenPayload): string {
    return this.generateToken(payload, this.refreshTokenSecret, this.refreshTokenExpiration, this.tokenAudience);
  }

  /**
   * 액세스 토큰 검증
   * @param token 액세스 토큰
   * @returns 토큰 페이로드
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.accessTokenSecret,
        issuer: this.tokenIssuer,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * 리프레시 토큰 검증
   * @param token 리프레시 토큰
   * @returns 토큰 페이로드
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.refreshTokenSecret,
        issuer: this.tokenIssuer,
        audience: this.tokenAudience,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
