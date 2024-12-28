import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  private context: string = 'NaverStrategy';
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'), //.env파일에 들어있음
      clientSecret: configService.get<string>('NAVER_SECRET_KEY'), //.env파일에 들어있음
      callbackURL: configService.get<string>('NAVER_CALLBACK_URL'), //.env파일에 들어있음
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) {
    try {
      const { _json } = profile;
      const user = {
        provider: profile.provider,
        email: _json.email,
        provider_id: _json.id,
        name: profile.displayName,
        profile_image: _json.profile_image,
        providerData: profile,
        accessToken,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
