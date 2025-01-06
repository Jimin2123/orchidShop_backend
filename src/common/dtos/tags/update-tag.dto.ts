import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ description: '태그 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: '태그 이름', example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '태그 설명', example: 'This is an Apple', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTagsDto {
  @ApiProperty({
    description: '수정할 태그 배열',
    type: UpdateTagDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTagDto)
  tags: UpdateTagDto[];
}
