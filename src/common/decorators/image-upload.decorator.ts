import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { getStorageConfig } from '../utils/image-upload.util';

/**
 * 이미지 업로드 데코레이터
 * @param fieldName 업로드할 파일 필드명
 * @param destination 이미지 저장 경로
 * @param maxSizeMB 최대 파일 크기 (MB)
 */
export function UploadImage(fieldName: string, destination: string, maxSizeMB = 5) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        ...getStorageConfig(destination),
        limits: { fileSize: maxSizeMB * 1024 * 1024 }, // 최대 파일 크기 제한
      })
    )
  );
}
