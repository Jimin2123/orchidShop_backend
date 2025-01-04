import { Controller, Post, UploadedFile, UploadedFiles, UseGuards } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { UploadImage, UploadImages } from 'src/common/decorators/image-upload.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/role.decoratort';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SwaggerUploadProductImages, SwaggerUploadProfileImage } from 'src/common/swaggers/uploader.swagger';

@Controller('upload')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  @Post('product-images')
  @Roles(UserRole.ADMIN)
  @UploadImages('productImages', 'product-images', 10, 10)
  @SwaggerUploadProductImages()
  async uploadImages(@UploadedFiles() productImages: Express.Multer.File[]) {
    return this.uploaderService.uploadProductImages(productImages);
  }

  @Post('profile-image')
  @UploadImage('profileImage', 'profile-images', 2) // 프로필 이미지 업로드 (2MB 제한)
  @SwaggerUploadProfileImage()
  async uploadProfileImage(@CurrentUser() userId: string, @UploadedFile() profileImage: Express.Multer.File) {
    await this.uploaderService.uploadProfileImage(userId, profileImage);
    return profileImage;
  }
}
