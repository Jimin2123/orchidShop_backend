import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';

export class ProductImagesDTO {
  @ApiProperty({ description: 'Image ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Image URL', example: 'https://example.com/image.jpg' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Alternative text for image', nullable: true, example: 'Product image description' })
  @IsString()
  @IsOptional()
  altText: string;

  @ApiProperty({ description: 'Is main image?', default: false, example: true })
  @IsBoolean()
  isMain: boolean;

  @ApiProperty({ description: 'Image order', example: 1 })
  @IsInt()
  order: number;
}
