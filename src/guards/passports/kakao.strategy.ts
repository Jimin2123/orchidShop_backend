import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategty extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const { provider, id } = profile;

    console.log(profile);

    try {
      const user = {
        provider_id: id.toString(),
        provider: provider,
        name: profile.displayName,
        email: profile._json.kakao_account.email,
        profile_image: profile._json.kakao_account.profile.profile_image_url,
        accessToken,
        providerData: profile,
      };
      done(null, user);
    } catch (e) {
      done(e, false);
    }
  }
}
