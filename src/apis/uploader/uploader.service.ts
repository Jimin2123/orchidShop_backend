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

  async uploadProfileImage(userId: string, imagePath: string) {
    await this.userService.updateProfileImage(userId, imagePath);
  }
}
