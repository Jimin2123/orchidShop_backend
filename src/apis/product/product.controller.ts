import { BadRequestException, Body, Controller, Post, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { UploadImage, UploadImages } from 'src/common/decorators/image-upload.decorator';
import { ApiConsumes } from '@nestjs/swagger';
import { CreateFullProductDTO } from 'src/common/dtos/product/create-product.dto';
import { SwaggerCreateProduct } from 'src/common/swaggers/product.swagger';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UploadImage('images', 'product-images', 10)
  @ApiConsumes('multipart/form-data')
  async createProduct(@UploadedFiles() files: Express.Multer.File[], @Body() createProductDTO: CreateFullProductDTO) {
    await this.productService.createFullProductWithImages(files, createProductDTO);
  }

  @Post('create-product-swagger')
  @UploadImages('images', 'product-images', 10, 10)
  @SwaggerCreateProduct()
  async createProductSwagger(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('product') product: string,
    @Body('discounts') discounts: string,
    @Body('tags') tags: string
  ) {
    // JSON 데이터 파싱
    let parsedProduct, parsedDiscounts, parsedTags;
    try {
      parsedProduct = JSON.parse(product);
      parsedDiscounts = JSON.parse(discounts);
      parsedTags = tags.includes(',') ? tags.split(',') : [tags]; // 쉼표로 구분된 문자열을 배열로 변환
    } catch {
      throw new BadRequestException('Invalid JSON format in product, discounts, or tags');
    }

    if (!Array.isArray(parsedTags)) {
      throw new BadRequestException('Tags must be an array');
    }

    const createFullProductDTO = {
      product: parsedProduct,
      discounts: parsedDiscounts,
      tags: parsedTags,
      images: files.map((file) => file.filename),
    };

    return this.productService.createFullProductWithImages(files, createFullProductDTO);
  }
}
