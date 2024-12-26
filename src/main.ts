import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 보안 설정
  // 1. CORS 활성화
  app.enableCors({
    origin: ['https://your-allowed-origin.com'], // 필요한 도메인으로 변경
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Helmet으로 HTTP 보안 헤더 추가
  app.use(helmet());

  // 3. Rate Limiting 설정 (초당 요청 제한)
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1분
      max: 100, // 분당 최대 100개의 요청
      message: 'Too many requests from this IP, please try again after a minute.',
    })
  );

  // 애플리케이션 실행
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
  console.log(`Swagger is available at: http://localhost:${PORT}/api`);
}
bootstrap();
