import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from 'src/entites/product.entity';
import { ProductTags } from 'src/entites/product-tags.entity';
import { ProductImages } from 'src/entites/product-images.entity';
import { ProductDiscount } from 'src/entites/product-discount.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import ProductPriceHistory from 'src/entites/product-price-history.entity';
import { Category } from 'src/entites/categories.entity';
import { ProductView } from 'src/entites/product-view.entity';
import { Tag } from 'src/entites/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductTags,
      ProductImages,
      ProductDiscount,
      ProductPriceHistory,
      ProductView,
      Category,
      Tag,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
