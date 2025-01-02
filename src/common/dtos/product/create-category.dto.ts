import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: '카테고리 이름',
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

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

export class CreateCategoriesDto {
  @ApiProperty({
    description: '생성할 카테고리 배열',
    type: [CreateCategoryDto],
  })
  @IsArray() // 배열임을 명시
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  categories: CreateCategoryDto[];
}
