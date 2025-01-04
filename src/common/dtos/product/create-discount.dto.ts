import { IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductDiscountType } from 'src/common/enums/product-discount.enum';
import { DiscountAppliesTo } from 'src/common/enums/product-discount-applies-to.enum';

export class DiscountDto {
  @ApiProperty({
    description: '할인 유형 (예: PERCENTAGE, FIXED)',
    enum: ProductDiscountType,
    example: ProductDiscountType.PERCENTAGE,
  })
  @IsEnum(ProductDiscountType)
  type: ProductDiscountType;

  @ApiProperty({
    description: '할인율 (5자리 소수, 2자리 정밀도)',
    required: false,
    example: 10,
  })
  @ValidateIf((o) => o.type === ProductDiscountType.PERCENTAGE)
  @IsNumber()
  discountRate?: number;

  @ApiProperty({
    description: '할인 금액 또는 할인율 (10자리 소수, 2자리 정밀도)',
    example: 100,
  })
  @ValidateIf((o) => o.type === ProductDiscountType.FIXED_AMOUNT)
  @IsNumber()
  fixedAmount?: number;

  @ApiProperty({
    description: '할인 시작일',
    required: false,
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '할인 종료일',
    required: false,
    format: 'date-time',
    example: '2025-01-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '활성화 여부',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: '할인 적용 대상 (옵션)',
    enum: DiscountAppliesTo,
    required: false,
    example: DiscountAppliesTo.USER,
  })
  @IsOptional()
  @IsEnum(DiscountAppliesTo)
  appliesTo?: DiscountAppliesTo;
}
