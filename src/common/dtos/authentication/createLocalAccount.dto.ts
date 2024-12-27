import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateUserDto } from '../user/createUser.dto';
import { CreateAddressDto } from '../user/createAddress.dto';

export class CreateLocalAccountDto {
  @ApiProperty({ description: '이메일', example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'example123' })
  @IsString()
  password: string;
}

export class SignUpDto {
  @ApiProperty({ description: '로컬 계정 정보', type: CreateLocalAccountDto })
  @ValidateNested()
  @Type(() => CreateLocalAccountDto)
  @IsNotEmpty()
  localAccount: CreateLocalAccountDto;

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

  @ApiProperty({
    description: '사용자 프로필 이미지',
    type: 'string',
    format: 'binary',
  })
  profileImage?: any;
}
