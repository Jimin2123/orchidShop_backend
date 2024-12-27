import { Body, Controller, Post, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from 'src/common/dtos/authentication/createLocalAccount.dto';
import { SwaggerSignup } from 'src/common/swaggers/auth.swagger';
import { UploadImage } from 'src/common/decorators/image-upload.decorator';
import { ApiFileUpload } from 'src/common/swaggers/image-upload.swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UploadImage('profileImage', 'profile-images', 2) // 프로필 이미지 업로드 (2MB 제한)
  @ApiFileUpload([{ name: 'profileImage', description: '사용자 프로필 이미지' }]) // Swagger 설정
  @SwaggerSignup()
  async signup(
    @Body() body: any, // raw 데이터로 수신
    @UploadedFile() profileImage?: Express.Multer.File
  ) {
    // JSON 데이터를 DTO로 변환
    const parsedBody = {
      localAccount: JSON.parse(body.localAccount),
      user: JSON.parse(body.user),
      address: JSON.parse(body.address),
    };

    // DTO로 매핑
    const signUpDto = plainToInstance(SignUpDto, parsedBody);

    // DTO 유효성 검증
    const errors = await validate(signUpDto);
    if (errors.length > 0) {
      // 에러가 있으면 상세 에러 메시지 반환
      throw new Error(`Validation failed: ${errors.map((err) => err.toString()).join(', ')}`);
    }

    // 프로필 이미지 경로 추가
    const imagePath = profileImage ? profileImage.path : null;

    // 회원가입 처리
    return this.authService.signup(signUpDto, imagePath);
  }
}
