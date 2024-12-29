import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  id?: string; // 업데이트할 주소 ID

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  detailAddress?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
