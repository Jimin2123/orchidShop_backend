import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'src/configs/winston.config';
import { CustomWinstonLogger } from './logger.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [CustomWinstonLogger],
  exports: [WinstonModule, CustomWinstonLogger],
})
export class CustomWinstonModule {}
