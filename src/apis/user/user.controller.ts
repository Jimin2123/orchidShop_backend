import { Controller, Post, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { UploadImage } from 'src/common/decorators/image-upload.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UploadImage('profileImage', 'profile-images', 2) // 프로필 이미지 업로드 (2MB 제한)
  async uploadImage(@UploadedFile() profileImage?: Express.Multer.File) {
    const userId = ''; // 아직 사용자 인증이 구현되지 않았으므로 사용자 ID를 하드코딩
    const imagePath = profileImage ? profileImage.path : null;
    await this.userService.updateProfileImage(userId, imagePath);
  }
}
