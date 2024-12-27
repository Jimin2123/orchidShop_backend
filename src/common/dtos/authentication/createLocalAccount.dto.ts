import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateUserDto } from '../user/createUser.dto';
import { CreateAddressDto } from '../user/createAddress.dto';

export class LocalAccountDto {
  @ApiProperty({ description: '이메일', example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'example123' })
  @IsString()
  password: string;
}

export class SignUpDto {
  @ApiProperty({ description: '로컬 계정 정보', type: LocalAccountDto })
  @ValidateNested()
  @Type(() => LocalAccountDto)
  @IsNotEmpty()
  localAccount: LocalAccountDto;

  @ApiProperty({ description: '사용자 정보', type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  @IsNotEmpty()
  user: CreateUserDto;

  @ApiProperty({ description: '주소 정보', type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address: CreateAddressDto;
}

class SocialUser {
  @IsString()
  provider_id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  profile_image?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  provider: string;

  @IsString()
  accessToken: string;

  providerData: Record<string, any>;
}

export class SocialRequest {
  @ValidateNested()
  @Type(() => SocialUser)
  readonly user: SocialUser;
}
