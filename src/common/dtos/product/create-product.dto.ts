import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, IsUUID, IsObject, ValidateNested } from 'class-validator';
import { CreateDiscountDTO } from './create-product-discount.dto';

export class CreateProductDTO {
  @ApiProperty({ description: 'Product name', example: 'Smartphone' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description', example: 'A high-end smartphone' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price', example: 999.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Product quantity', example: 100 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Category ID', example: 'category-id' })
  @IsUUID()
  @IsOptional()
  categoryId: string;
}

export class CreateFullProductDTO {
  @ApiProperty({ description: 'Product details' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateProductDTO)
  product: CreateProductDTO;

  @ApiProperty({ description: 'Discounts for the product', type: [CreateDiscountDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDiscountDTO)
  discounts: CreateDiscountDTO[];

  @ApiProperty({ description: 'Tag IDs associated with the product', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'Image files',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  images: any[];
}
