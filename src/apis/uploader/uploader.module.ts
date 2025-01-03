import { Module } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { UploaderController } from './uploader.controller';
import { UserService } from '../user/user.service';

@Module({
  imports: [UserService],
  controllers: [UploaderController],
  providers: [UploaderService],
})
export class UploaderModule {}
