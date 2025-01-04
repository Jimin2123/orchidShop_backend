import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function SwaggerUploadProfileImage() {
  return applyDecorators(
    ApiOperation({ summary: '프로필 이미지 업로드', description: '사용자의 프로필 이미지를 업로드합니다.' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          profileImage: {
            type: 'string',
            format: 'binary',
            description: '업로드할 프로필 이미지 파일',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: '이미지 업로드 성공' }),
    ApiResponse({ status: 400, description: '잘못된 요청 (예: 파일 미전송, 허용되지 않는 파일 형식)' }),
    ApiResponse({ status: 500, description: '서버 에러' })
  );
}

export function SwaggerUploadProductImages() {
  return applyDecorators(
    ApiOperation({ summary: '제품 이미지 업로드', description: '여러 개의 제품 이미지를 업로드합니다.' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          productImages: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
              description: '업로드할 제품 이미지 파일',
            },
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: '이미지 업로드 성공' }),
    ApiResponse({ status: 400, description: '잘못된 요청 (예: 파일 미전송, 허용되지 않는 파일 형식)' }),
    ApiResponse({ status: 500, description: '서버 에러' })
  );
}
