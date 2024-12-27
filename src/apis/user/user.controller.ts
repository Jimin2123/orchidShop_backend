import { Controller, Get, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UploadImage } from 'src/common/decorators/image-upload.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@CurrentUser() userId: string) {
    return await this.userService.findUserById(userId);
  }

  @Post('upload-image')
  @UploadImage('profileImage', 'profile-images', 2) // 프로필 이미지 업로드 (2MB 제한)
  async uploadImage(@CurrentUser() userId: string, @UploadedFile() profileImage?: Express.Multer.File) {
    const imagePath = profileImage ? profileImage.path : null;
    await this.userService.updateProfileImage(userId, imagePath);
  }
}
