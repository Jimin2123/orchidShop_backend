import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoriesDto } from 'src/common/dtos/product/create-category.dto';
import { CreateProductDto } from 'src/common/dtos/product/create-product.dto';
import { CreateTagsDto } from 'src/common/dtos/product/create-tag.dto';
import { ProductDiscountType } from 'src/common/enums/product-discount.enum';
import { TransactionUtil } from 'src/common/utils/transcation.util';
import { Category } from 'src/entites/categories.entity';
import { ProductDiscount } from 'src/entites/product-discount.entity';
import { ProductImages } from 'src/entites/product-images.entity';
import ProductPriceHistory from 'src/entites/product-price-history.entity';
import { ProductTags } from 'src/entites/product-tags.entity';
import { ProductView } from 'src/entites/product-view.entity';
import { Product } from 'src/entites/product.entity';
import { Tag } from 'src/entites/tag.entity';
import { DataSource, In, Repository } from 'typeorm';

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
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource,
    private readonly transactionUtil: TransactionUtil
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return await this.transactionUtil.runInTransaction(this.dataSource, async (queryRunner) => {
      const categoryRepository = queryRunner.manager.getRepository(Category);
      const category = await categoryRepository.findOne({ where: { id: createProductDto.categoryId } });

      // 1. 제품 생성
      const productRepository = queryRunner.manager.getRepository(Product);

      const product = productRepository.create({ ...createProductDto, category });
      const savedProduct = await productRepository.save(product);

      // 2. 이미지 처리
      if (createProductDto.files && createProductDto.files.length > 0) {
        const productImagesRepository = queryRunner.manager.getRepository(ProductImages);
        const imageEntities = createProductDto.files.map((file, index) =>
          productImagesRepository.create({
            product: savedProduct,
            url: file,
            altText: file,
            isMain: index === 0, // 첫 번째 이미지를 메인으로 설정
          })
        );
        await productImagesRepository.save(imageEntities);
      }

      // 3. 할인 정보 처리
      if (createProductDto.discount) {
        const { type, discountRate, value } = createProductDto.discount;

        if (type === ProductDiscountType.PERCENTAGE && !discountRate) {
          throw new Error('DiscountRate is required for PERCENTAGE type discounts.');
        }
        if (type === ProductDiscountType.FIXED_AMOUNT && !value) {
          throw new Error('Value is required for FIXED type discounts.');
        }

        const productDiscountRepository = queryRunner.manager.getRepository(ProductDiscount);
        const discountEntity = productDiscountRepository.create({
          ...createProductDto.discount,
          product: savedProduct,
        });
        await productDiscountRepository.save(discountEntity);
      }

      if (createProductDto.tagIds && createProductDto.tagIds.length > 0) {
        const tagRepository = queryRunner.manager.getRepository(Tag);
        const tags = await tagRepository.find({ where: { id: In(createProductDto.tagIds) } });

        if (tags.length !== createProductDto.tagIds.length) {
          throw new Error('Some tags not found.');
        }

        const productTagsRepository = queryRunner.manager.getRepository(ProductTags);
        const productTags = tags.map((tag) =>
          productTagsRepository.create({
            product: savedProduct,
            tag,
          })
        );
        await productTagsRepository.save(productTags);
      }

      // 4. 가격 기록 생성
      const productPriceHistoryRepository = queryRunner.manager.getRepository(ProductPriceHistory);
      const priceHistory = productPriceHistoryRepository.create({
        product: savedProduct,
        price: savedProduct.price,
        startDate: new Date(),
      });
      await productPriceHistoryRepository.save(priceHistory);

      // 5. 초기 조회 정보 생성
      const productViewRepository = queryRunner.manager.getRepository(ProductView);
      const productView = productViewRepository.create({
        product: savedProduct,
        viewCount: 0,
        lastViewedAt: null,
      });
      await productViewRepository.save(productView);

      return savedProduct;
    });
  }

  async uploadProductImages(body: any, files: Express.Multer.File[]): Promise<ProductImages[]> {
    const { productId } = body;

    if (!productId) {
      throw new Error('Product ID is required.');
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const productImages = files.map((file, index) =>
      this.productImagesRepository.create({
        product,
        url: `uploads/products/${file.filename}`,
        altText: file.originalname,
        isMain: index === 0, // 첫 번째 이미지를 메인으로 설정
      })
    );

    return await this.productImagesRepository.save(productImages);
  }

  async createCategories(createCategoriesDto: CreateCategoriesDto): Promise<Category[]> {
    const { categories } = createCategoriesDto;

    // 결과를 저장할 배열
    const createdCategories: Category[] = [];

    for (const dto of categories) {
      const { name, description, parentId } = dto;

      // 1. 상위 카테고리 확인
      let parentCategory: Category | null = null;
      if (parentId) {
        parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
        if (!parentCategory) {
          throw new Error(`Parent category with ID ${parentId} not found.`);
        }
      }

      // 2. 새 카테고리 생성
      const newCategory = this.categoryRepository.create({
        name,
        description,
        parent: parentCategory,
      });

      // 3. 저장
      const savedCategory = await this.categoryRepository.save(newCategory);

      // 4. 결과 배열에 추가
      createdCategories.push(savedCategory);
    }

    return createdCategories;
  }

  async createTags(createTagsDto: CreateTagsDto): Promise<Tag[]> {
    const tags = createTagsDto.categories;

    // 중복 태그 확인
    const existingTags = await this.tagRepository.findBy({
      name: In(tags.map((tag) => tag.name)), // 배열을 In 연산자로 전달
    });

    if (existingTags.length > 0) {
      const existingNames = existingTags.map((tag) => tag.name).join(', ');
      throw new BadRequestException(`Duplicate tags: ${existingNames}`);
    }

    // 태그 생성
    const newTags = this.tagRepository.create(tags);
    return await this.tagRepository.save(newTags);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    await this.productRepository.remove(product);
  }

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['view', 'productTags', 'images', 'priceHistories', 'discounts', 'couponTargets', 'category'],
    });
  }

  async getProductById(id: string): Promise<Product> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['view', 'productTags', 'images', 'priceHistories', 'discounts', 'couponTargets', 'category'],
    });
  }
}
