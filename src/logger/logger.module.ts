import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'src/configs/winston.config';
import { CustomWinstonLogger } from './logger.service';
import { TransactionUtil } from 'src/common/utils/transcation.util';
import { TypeOrmLogger } from './typeorm-logger.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [CustomWinstonLogger, TransactionUtil, TypeOrmLogger],
  exports: [WinstonModule, CustomWinstonLogger, TransactionUtil, TypeOrmLogger],
})
export class CustomWinstonModule {}
