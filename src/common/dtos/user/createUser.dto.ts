import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '사용자 닉네임', example: 'hong' })
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @ApiProperty({ description: '사용자 프로필 이미지', example: 'default-image' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: '사용자 성별 (true = 남성, false = 여성)', example: true })
  @IsBoolean()
  gender: boolean;

  @ApiProperty({ description: '사용자 생년월일', example: '1990-01-01' })
  @IsString()
  birth: string;

  @ApiProperty({ description: '사용자 전화번호', example: '010-1234-5678' })
  @IsString()
  phone: string;
}
