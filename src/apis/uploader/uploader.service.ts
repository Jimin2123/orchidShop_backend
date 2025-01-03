import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class UploaderService {
  constructor(private readonly userService: UserService) {}

  async uploadProfileImage(userId: string, imagePath: string) {
    await this.userService.updateProfileImage(userId, imagePath);
  }
}
