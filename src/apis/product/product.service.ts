import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFullProductDTO } from 'src/common/dtos/product/create-product.dto';
import { Category } from 'src/entites/categories.entity';
import { ProductDiscount } from 'src/entites/product-discount.entity';
import { ProductImages } from 'src/entites/product-images.entity';
import ProductPriceHistory from 'src/entites/product-price-history.entity';
import { ProductTags } from 'src/entites/product-tags.entity';
import { ProductView } from 'src/entites/product-view.entity';
import { Product } from 'src/entites/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDiscount)
    private readonly productDiscountRepository: Repository<ProductDiscount>,
    @InjectRepository(ProductTags)
    private readonly productTagsRepository: Repository<ProductTags>,
    @InjectRepository(ProductImages)
    private readonly productImagesRepository: Repository<ProductImages>,
    @InjectRepository(ProductPriceHistory)
    private readonly productPriceHistoryRepository: Repository<ProductPriceHistory>,
    @InjectRepository(ProductView)
    private readonly productViewRepository: Repository<ProductView>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async createFullProductWithImages(files: Express.Multer.File[], createFullProductDTO: CreateFullProductDTO) {
    const { product, discounts, tags } = createFullProductDTO;

    // 1. Product 생성
    const category = product.categoryId
      ? await this.categoryRepository.findOne({ where: { id: product.categoryId } })
      : null;

    const productEntity = this.productRepository.create({ ...product, category });
    const savedProduct = await this.productRepository.save(productEntity);

    // 2. Discounts 저장
    if (discounts && discounts.length > 0) {
      const discountEntities = discounts.map((discount) =>
        this.productDiscountRepository.create({ ...discount, product: savedProduct })
      );
      await this.productDiscountRepository.save(discountEntities);
    }

    // 3. Tags 저장
    if (tags && tags.length > 0) {
      const tagEntities = tags.map((tagId) =>
        this.productTagsRepository.create({ product: savedProduct, tag: { id: tagId } })
      );
      await this.productTagsRepository.save(tagEntities);
    }

    // 4. 이미지 처리
    const imageEntities = files.map((file, index) =>
      this.productImagesRepository.create({
        product: savedProduct,
        url: file.path,
        altText: file.originalname,
        isMain: index === 0,
        order: index + 1,
      })
    );
    await this.productImagesRepository.save(imageEntities);

    // 5. ProductPriceHistory 생성
    const priceHistoryEntity = this.productPriceHistoryRepository.create({
      product: savedProduct,
      price: product.price,
      startDate: new Date(),
    });
    await this.productPriceHistoryRepository.save(priceHistoryEntity);

    // 6. ProductView 생성
    const viewEntity = this.productViewRepository.create({
      product: savedProduct,
      viewCount: 0,
    });
    await this.productViewRepository.save(viewEntity);

    return {
      product: savedProduct,
      discounts,
      tags,
      images: imageEntities,
    };
  }
}
