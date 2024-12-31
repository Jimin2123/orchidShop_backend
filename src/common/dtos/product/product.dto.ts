import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber, IsInt, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ProductStatus } from 'src/common/enums/product-status.enum';

export class ProductDTO {
  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product Name', example: 'Smartphone' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product Description', example: 'A high-end smartphone with excellent features' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product Price', example: 999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty({ description: 'Quantity in stock', example: 100 })
  @IsInt()
  quantity: number;

  @ApiProperty({ description: 'Is featured product?', default: false, example: true })
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({ description: 'Product status', enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty({ description: 'Category ID', nullable: true, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  categoryId: string;
}
