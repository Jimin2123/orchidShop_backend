import { BadRequestException, Body, Controller, Post, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from 'src/common/dtos/product/create-product.dto';
import { UploadImages } from 'src/common/decorators/image-upload.decorator';
import { CreateCategoriesDto } from 'src/common/dtos/product/create-category.dto';
import { CreateTagsDto } from 'src/common/dtos/product/create-tag.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    console.log(createProductDto);
    return await this.productService.createProduct(createProductDto);
  }

  @Post('upload-images')
  @UploadImages('files', 'product-images', 10, 10) // 다중 이미지 업로드 처리
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }
    const fileUrls = files.map((file) => `uploads/products/${file.filename}`);
    return {
      message: 'Images uploaded successfully',
      fileUrls,
    };
  }

  @Post('category')
  async createCategories(@Body() createCategoriesDto: CreateCategoriesDto) {
    return await this.productService.createCategories(createCategoriesDto);
  }

  @Post('tag')
  async createTags(@Body() createTagsDto: CreateTagsDto) {
    return await this.productService.createTags(createTagsDto);
  }
}
