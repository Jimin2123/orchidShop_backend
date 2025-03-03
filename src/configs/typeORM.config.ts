import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmLogger } from 'src/logger/typeorm-logger.service';

export const typeORMConfig = (configService: ConfigService, typeormLogger: TypeOrmLogger): TypeOrmModuleOptions => ({
  type: configService.get<string>('DATABASE_TYPE') as 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'mssql',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true, // 개발 환경에서만 true로 설정, 프로덕션에서는 false로 설정
  autoLoadEntities: true,
  logger: typeormLogger,
  logging: ['query', 'error', 'warn'], // 필요한 로그만 활성화
});
