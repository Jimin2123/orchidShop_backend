import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductTagsDto {
  @ApiProperty({ description: '추가할 태그 ID 목록', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addTags: string[];

  @ApiProperty({ description: '삭제할 태그 ID 목록', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeTags: string[];
}
