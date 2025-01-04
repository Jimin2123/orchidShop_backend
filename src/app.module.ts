import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeORM.config';
import { AuthModule } from './apis/auth/auth.module';
import { UserModule } from './apis/user/user.module';
import { ClsModule } from 'nestjs-cls';
import { ContextMiddleware } from './pipes/middlewares/context.middleware';
import { CustomWinstonModule } from './logger/logger.module';
import { LoggingMiddleware } from './pipes/middlewares/logging.middleware';
import { TypeOrmLogger } from './logger/typeorm-logger.service';
import { ProductModule } from './apis/product/product.module';
import { UploaderModule } from './apis/uploader/uploader.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TagsModule } from './apis/tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({ global: true }),
    CustomWinstonModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, TypeOrmLogger],
      useFactory: typeORMConfig,
      extraProviders: [TypeOrmLogger],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 정적 파일을 제공할 디렉토리
      serveRoot: '/uploads', // 정적 파일을 제공할 경로
    }),
    AuthModule,
    UserModule,
    ProductModule,
    UploaderModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*'); // 모든 경로에 미들웨어 적용
    consumer.apply(LoggingMiddleware).forRoutes('*'); // 모든 라우트에 미들웨어 적용
  }
}
