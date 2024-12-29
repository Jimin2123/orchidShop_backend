import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function SwaggerGetProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 프로필 가져오는 API',
    }),
    ApiBearerAuth('JWT'),
    ApiResponse({
      status: 200,
      description: '사용자 정보를 성공적으로 반환합니다.',
    }),
    ApiResponse({
      status: 401,
      description: '인증에 실패했습니다.',
    }),
    ApiResponse({
      status: 404,
      description: '해당 ID의 사용자를 찾을 수 없습니다.',
    })
  );
}

export function SwaggerUploadImage() {
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
