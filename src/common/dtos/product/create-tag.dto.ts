import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: '태그 이름', example: 'Apple' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '태그 설명', example: 'this is a Apple', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateTagsDto {
  @ApiProperty({
    description: '생성할 태그 배열',
    type: [CreateTagDto],
  })
  @IsArray() // 배열임을 명시
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  categories: CreateTagDto[];
}
