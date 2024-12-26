import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { SwaggerUserRegister } from 'src/common/swaggers/auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @SwaggerUserRegister()
  async register(@Body() createSignUpDto: SignUpDto) {
    const user = await this.authService.register(createSignUpDto);
    return user;
  }
}
