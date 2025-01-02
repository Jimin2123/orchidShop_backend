import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiscountDto } from './create-discount.dto';
import { ProductStatus } from 'src/common/enums/product-status.enum';

export class CreateProductDto {
  @ApiProperty({
    description: '제품 이름',
    example: 'iPhone 14',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '제품 설명',
    example: 'Latest Apple smartphone with A16 chip.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: '제품 가격',
    example: 999.99,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: '제품 재고 수량',
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: '제품 상태 (예: ACTIVE, INACTIVE)',
    example: 'ACTIVE',
  })
  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty({
    description: '추천 제품 여부',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    description: '연결할 태그 ID 배열',
    type: [String],
    required: false,
    example: ['tag1', 'tag2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({})
  @IsArray()
  @IsOptional()
  files?: string[];

  @ApiProperty({
    description: '할인 정보 (선택)',
    required: false,
    type: DiscountDto,
  })
  @IsOptional()
  discount?: DiscountDto;
}
