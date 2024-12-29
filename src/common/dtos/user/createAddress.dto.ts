import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: '사용자 주소', example: '서울시 강남구' })
  @IsString()
  address: string;

  @ApiProperty({ description: '사용자 상세주소', example: '역삼동 123-456' })
  @IsString()
  detailAddress: string;

  @ApiProperty({ description: '사용자 우편번호', example: '12345' })
  @IsString()
  zipCode: string;

  @ApiProperty({ description: '도시', example: '서울' })
  @IsString()
  city: string;

  @ApiProperty({ description: '도/시/군', example: '강남' })
  @IsString()
  state: string;

  @ApiProperty({ description: '사용자 기본 주소', example: true })
  @IsBoolean()
  isDefault: boolean;
}
