import { IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductDiscountType } from 'src/common/enums/product-discount.enum';
import { DiscountAppliesTo } from 'src/common/enums/product-discount-applies-to.enum';

export class UpdateDiscountDto {
  @ApiProperty({ description: '할인 유형 (PERCENTAGE / FIXED)', required: false, enum: ProductDiscountType })
  @IsOptional()
  @IsEnum(ProductDiscountType)
  type?: ProductDiscountType;

  @ApiProperty({ description: '할인율 (PERCENTAGE일 경우 필수)', required: false })
  @IsOptional()
  @IsNumber()
  discountRate?: number;

  @ApiProperty({ description: '할인 금액 (FIXED일 경우 필수)', required: false })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({ description: '할인 시작일', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '할인 종료일', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '할인 활성화 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '할인 적용 대상 (PRODUCT / CATEGORY 등)', required: false, enum: DiscountAppliesTo })
  @IsOptional()
  @IsEnum(DiscountAppliesTo)
  appliesTo?: DiscountAppliesTo;
}
