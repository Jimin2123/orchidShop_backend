import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagsDto } from 'src/common/dtos/tags/create-tag.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decoratort';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateTagDto, UpdateTagsDto } from 'src/common/dtos/tags/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post('tag')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTags(@Body() createTagsDto: CreateTagsDto) {
    return await this.tagsService.createTags(createTagsDto);
  }

  @Get()
  async getTags() {
    return await this.tagsService.getTags();
  }

  @Get(':id')
  async getTag(@Param('id') id: string) {
    return await this.tagsService.getTag(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTags(@Body() updateTagDto: UpdateTagsDto) {
    return await this.tagsService.updateTags(updateTagDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return await this.tagsService.updateTag(id, updateTagDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTag(@Param('id') id: string) {
    return await this.tagsService.deleteTag(id);
  }
}
