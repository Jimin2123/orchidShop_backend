import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '카테고리 이름 (선택)',
    example: 'Electronics',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '카테고리 설명 (선택)',
    example: 'This category contains all electronic products.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '상위 카테고리 ID (선택)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoriesDto {
  @ApiProperty({
    description: '수정할 카테고리 배열',
    type: [UpdateCategoryDto],
  })
  @IsArray() // 배열임을 명시
  @ValidateNested({ each: true })
  @Type(() => UpdateCategoryDto)
  categories: UpdateCategoryDto[];
}
