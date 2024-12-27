import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAccountDto, SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { SwaggerLogin, SwaggerSignup } from 'src/common/swaggers/auth.swagger';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @SwaggerSignup()
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('login')
  @SwaggerLogin()
  async login(@Body() localAccount: LocalAccountDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(localAccount);

    // refreshToken 쿠키 설정
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }
}
