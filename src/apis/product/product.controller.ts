import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from 'src/common/dtos/product/create-product.dto';
import { UploadImages } from 'src/common/decorators/image-upload.decorator';
import { CreateCategoriesDto } from 'src/common/dtos/product/create-category.dto';
import { CreateTagsDto } from 'src/common/dtos/product/create-tag.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decoratort';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateProductDto } from 'src/common/dtos/product/update-product.dto';

@Controller('product')
@ApiBearerAuth('JWT')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    console.log(createProductDto);
    return await this.productService.createProduct(createProductDto);
  }

  @Post('upload-images')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  @UploadImages('files', 'product-images', 10, 10) // 다중 이미지 업로드 처리
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }
    const fileUrls = files.map((file) => `uploads/product-images/${file.filename}`);
    return {
      message: 'Images uploaded successfully',
      fileUrls,
    };
  }

  @Post('category')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async createCategories(@Body() createCategoriesDto: CreateCategoriesDto) {
    return await this.productService.createCategories(createCategoriesDto);
  }

  @Post('tag')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async createTags(@Body() createTagsDto: CreateTagsDto) {
    return await this.productService.createTags(createTagsDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(id);
  }

  @Get()
  async getProducts() {
    return await this.productService.getProducts();
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productService.getProductById(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // 요청 데이터와 업로드된 파일을 서비스로 전달
    const updatedProduct = await this.productService.updateProduct(id, updateProductDto);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }
}
