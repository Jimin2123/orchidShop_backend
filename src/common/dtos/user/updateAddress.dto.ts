import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({ description: '주소 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  id?: string; // 업데이트할 주소 ID

  @ApiProperty({ description: '사용자 주소', example: '서울시 강남구' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: '사용자 상세주소', example: '역삼동 123-456' })
  @IsString()
  @IsOptional()
  detailAddress?: string;

  @ApiProperty({ description: '사용자 우편번호', example: '12345' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ description: '도시', example: '서울' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: '도/시/군', example: '강남' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: '사용자 기본 주소', example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
