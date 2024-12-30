import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateLocalAccountDto {
  @ApiProperty({ description: '사용자 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: '이메일', example: 'test123@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '비밀번호', example: 'example123' })
  @IsString()
  @IsOptional()
  password?: string; // 암호화는 Service에서 처리

  @ApiProperty({ description: '마지막 로그인 일시', example: '2024-12-30' })
  @IsOptional()
  @IsDateString()
  lastLogin?: string;

  @ApiProperty({ description: '로그인 시도 횟수', example: 0 })
  @IsOptional()
  @IsNumber()
  loginAttempt?: number;
}
