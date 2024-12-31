import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsDate } from 'class-validator';

export class ProductViewDTO {
  @ApiProperty({ description: 'Product View ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product ID', nullable: true, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  productId: string;

  @ApiProperty({ description: 'View count', default: 0, example: 10 })
  @IsInt()
  viewCount: number;

  @ApiProperty({ description: 'Last viewed at', nullable: true, example: '2023-12-31T12:00:00Z' })
  @IsDate()
  @IsOptional()
  lastViewedAt: Date;
}
