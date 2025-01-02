import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from 'src/common/enums/product-status.enum';
import { UpdateDiscountDto } from './update-discount.dto';
import { Type } from 'class-transformer';
import { UpdateTagsDto } from './update-product-tags.dto';
import { UpdateProductImageDto } from './updpate-product-images.dto';

export class UpdateProductDto {
  @ApiProperty({ description: '제품 이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '제품 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '제품 가격', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: '제품 수량', required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ description: '추천 제품 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: '제품 상태 (ACTIVE / INACTIVE)', required: false, enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: '카테고리 ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: '삭제할 이미지 ID 목록', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeImageIds?: string[];

  @ApiProperty({ description: '수정할 이미지 정보 목록', type: [UpdateProductImageDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductImageDto)
  updateImages?: UpdateProductImageDto[];

  @ApiProperty({ description: '추가할 이미지 URL 목록', type: [String], required: false })
  @IsArray()
  @IsOptional()
  newImages?: string[];

  @ApiProperty({ description: '태그 정보', required: false, type: UpdateTagsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTagsDto)
  tags?: UpdateTagsDto;

  @ApiProperty({ description: '할인 정보', required: false, type: UpdateDiscountDto })
  @IsOptional()
  discount?: UpdateDiscountDto;
}
