import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ProductTagsDTO {
  @ApiProperty({ description: 'Product Tag ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Tag ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  tagId: string;
}
