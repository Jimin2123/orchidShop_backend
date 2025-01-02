import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductImageDto {
  @ApiProperty({ description: '수정할 이미지 ID', required: true })
  @IsString()
  imageId: string;

  @ApiProperty({ description: '이미지 대체 텍스트', required: false })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiProperty({ description: '메인 이미지 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
