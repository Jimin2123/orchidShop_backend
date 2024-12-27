import { Controller, Get, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UploadImage } from 'src/common/decorators/image-upload.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { SwaggerGetProfile, SwaggerUploadImage } from 'src/common/swaggers/user.swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @SwaggerGetProfile()
  async getUser(@CurrentUser() userId: string) {
    return await this.userService.findUserById(userId);
  }

  @Post('upload-image')
  @UploadImage('profileImage', 'profile-images', 2) // 프로필 이미지 업로드 (2MB 제한)
  @SwaggerUploadImage()
  async uploadImage(@CurrentUser() userId: string, @UploadedFile() profileImage?: Express.Multer.File) {
    const imagePath = profileImage ? profileImage.path : null;
    await this.userService.updateProfileImage(userId, imagePath);
  }
}
