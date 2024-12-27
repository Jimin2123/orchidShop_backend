import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAccountDto, SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { SwaggerLogin, SwaggerLogout, SwaggerRefreshToken, SwaggerSignup } from 'src/common/swaggers/auth.swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

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

  @Post('refresh-token')
  @SwaggerRefreshToken()
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const getRefreshToken = req.cookies['refreshToken'];
    if (!getRefreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const { accessToken, refreshToken } = await this.authService.refreshToken(getRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 동안 유지
    });

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @SwaggerLogout()
  async logout(@CurrentUser() userId: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    await this.authService.logout(userId);
  }
}
