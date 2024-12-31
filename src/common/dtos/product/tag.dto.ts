import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class TagDTO {
  @ApiProperty({ description: 'Tag ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Tag Name', example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tag Description', nullable: true, example: 'Category for electronic items' })
  @IsString()
  @IsOptional()
  description: string;
}
