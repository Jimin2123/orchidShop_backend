import { Module } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { UploaderController } from './uploader.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [UploaderController],
  providers: [UploaderService],
})
export class UploaderModule {}
