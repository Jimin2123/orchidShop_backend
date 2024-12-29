// dto/update-user.dto.ts
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UpdateLocalAccountDto } from '../authentication/updateLocalAccount.dto';
import { UpdateAddressDto } from './updateAddress.dto';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nickName?: string;

  @IsDateString()
  @IsOptional()
  birth?: Date;

  @IsBoolean()
  @IsOptional()
  gender?: boolean;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  @IsOptional()
  addresses?: UpdateAddressDto[];

  @ValidateNested()
  @Type(() => UpdateLocalAccountDto)
  @IsOptional()
  localAccount?: UpdateLocalAccountDto;
}
