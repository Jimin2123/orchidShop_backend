import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAccountDto, SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { SwaggerSignup } from 'src/common/swaggers/auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @SwaggerSignup()
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('login')
  async login(@Body() localAccount: LocalAccountDto) {
    const user = this.authService.login(localAccount);
    return user;
  }
}
