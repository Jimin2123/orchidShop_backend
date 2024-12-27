import { applyDecorators } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

interface UploadField {
  name: string; // 필드 이름
  description?: string; // Swagger 설명
}

export function ApiFileUpload(fields: UploadField[]) {
  if (!fields || !fields.length) {
    throw new Error('ApiFileUpload: At least one field must be provided.');
  }

  const properties = fields.reduce((acc, field) => {
    acc[field.name] = {
      type: 'string',
      format: 'binary', // 파일 업로드를 지원
      description: field.description || `${field.name} 파일 업로드`,
    };
    return acc;
  }, {});

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties,
      },
    })
  );
}
