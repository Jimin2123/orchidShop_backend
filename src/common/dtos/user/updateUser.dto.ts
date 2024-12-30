// dto/update-user.dto.ts
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UpdateLocalAccountDto } from '../authentication/updateLocalAccount.dto';
import { UpdateAddressDto } from './updateAddress.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Gender } from 'src/common/enums/gender.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '사용자 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '사용자 닉네임', example: 'hong' })
  @IsString()
  @IsOptional()
  nickName?: string;

  @ApiProperty({ description: '사용자 생년월일', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth?: string;

  @ApiProperty({ description: '사용자 성별', enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ description: '사용자 역할', enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: '사용자 활성화 여부', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: '사용자 전화번호', example: '010-1234-5678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '사용자 프로필 이미지', example: 'default-image', required: false })
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
