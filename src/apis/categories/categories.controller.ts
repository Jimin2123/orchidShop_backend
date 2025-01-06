import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Roles } from 'src/common/decorators/role.decoratort';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { CreateCategoriesDto } from 'src/common/dtos/categories/create-category.dto';
import { UpdateCategoriesDto } from 'src/common/dtos/categories/update-category.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('categories')
@ApiBearerAuth('JWT')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategoires(@Body() createCategoriesDto: CreateCategoriesDto) {
    return this.categoriesService.createCategories(createCategoriesDto);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCategories(@Body() updateCategoriesDto: UpdateCategoriesDto) {
    return this.categoriesService.updateCategories(updateCategoriesDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategories() {
    return 'delete categories';
  }

  @Get()
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  async getCategory() {
    return 'get category';
  }
}
