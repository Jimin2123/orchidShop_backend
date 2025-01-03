import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { getStorageConfig } from '../utils/image-upload.util';

/**
 * 이미지 업로드 데코레이터
 * @param fieldName 업로드할 파일 필드명
 * @param destination 이미지 저장 경로
 * @param maxSizeMB 최대 파일 크기 (MB)
 */
export function UploadImage(fieldName: string, destination: string, maxSizeMB = 5) {
  return applyDecorators(UseInterceptors(FileInterceptor(fieldName, getStorageConfig(destination, maxSizeMB))));
}

/**
 * 다중 이미지 업로드 데코레이터
 * @param fieldName 업로드할 파일 필드명
 * @param destination 이미지 저장 경로
 * @param maxSizeMB 최대 파일 크기 (MB)
 * @param maxFiles 최대 업로드 파일 수
 */
export function UploadImages(fieldName: string, destination: string, maxSizeMB = 5, maxFiles = 10) {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxFiles, getStorageConfig(destination, maxSizeMB)))
  );
}
