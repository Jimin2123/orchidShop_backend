import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsDate, IsOptional } from 'class-validator';

export class ProductPriceHistoryDTO {
  @ApiProperty({ description: 'Price History ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Recorded price', example: 1000.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty({ description: 'Price start date', example: '2024-01-01T00:00:00Z' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Price end date', nullable: true, example: '2024-12-31T23:59:59Z' })
  @IsDate()
  @IsOptional()
  endDate: Date;
}
