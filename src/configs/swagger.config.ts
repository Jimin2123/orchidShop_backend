import { DocumentBuilder } from '@nestjs/swagger';

const swaggerConfig = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('API')
  .setVersion('1.0')
  .addTag('')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token'
  )
  .build();

export default swaggerConfig;
