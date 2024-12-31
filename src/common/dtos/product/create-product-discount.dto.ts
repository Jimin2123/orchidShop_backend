import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { ProductDiscountType } from 'src/common/enums/product-discount.enum';
import { DiscountAppliesTo } from 'src/common/enums/product-discount-applies-to.enum';

export class CreateDiscountDTO {
  @ApiProperty({ description: 'Discount type', enum: ProductDiscountType, example: ProductDiscountType.PERCENTAGE })
  @IsEnum(ProductDiscountType)
  type: ProductDiscountType;

  @ApiProperty({ description: 'Discount rate', example: 15.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  discountRate: number;

  @ApiProperty({ description: 'Discount value', example: 50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  value: number;

  @ApiProperty({ description: 'Discount start date', example: '2024-01-01T00:00:00Z' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Discount end date', nullable: true, example: '2024-12-31T23:59:59Z' })
  @IsDate()
  @IsOptional()
  endDate: Date;

  @ApiProperty({ description: 'Is discount active?', default: true, example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Applies to',
    enum: DiscountAppliesTo,
    nullable: true,
    example: DiscountAppliesTo.CATEGORY,
  })
  @IsEnum(DiscountAppliesTo)
  @IsOptional()
  appliesTo: DiscountAppliesTo;
}
