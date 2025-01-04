import { BadRequestException, Controller, Post, UploadedFiles, UseGuards } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { UploadImage, UploadImages } from 'src/common/decorators/image-upload.decorator';
import { SwaggerUploadImage } from 'src/common/swaggers/user.swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/role.decoratort';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('uploader')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  @Post('images/product')
  @Roles(UserRole.ADMIN)
  @UploadImages('productImages', 'product-images', 10, 10)
  async uploadImages(@UploadedFiles() productImages: Express.Multer.File[]) {
    return this.uploaderService.uploadProductImages(productImages);
  }

  @Post('image/profile')
  @UploadImage('profileImage', 'profile-images', 2)
  @SwaggerUploadImage()
  async uploadProfileImage(@CurrentUser() userId: string, @UploadedFiles() profileImage: Express.Multer.File) {
    if (!profileImage) {
      throw new BadRequestException('No files uploaded.');
    }
    const imagePath = profileImage ? profileImage.path : null;
    await this.uploaderService.uploadProfileImage(userId, imagePath);
    return profileImage;
  }
}
