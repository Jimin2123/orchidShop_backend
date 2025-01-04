import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class UploaderService {
  constructor(private readonly userService: UserService) {}

  uploadProductImages(productImages: Express.Multer.File[]): Express.Multer.File[] {
    if (!productImages || productImages.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }

    return productImages;
  }

  async uploadProfileImage(userId: string, profileImage: Express.Multer.File): Promise<void> {
    const imagePath = profileImage ? profileImage.path : null;
    await this.userService.updateProfileImage(userId, imagePath);
  }
}
