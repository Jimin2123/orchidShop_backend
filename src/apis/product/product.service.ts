import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoriesDto } from 'src/common/dtos/product/create-category.dto';
import { CreateProductDto } from 'src/common/dtos/product/create-product.dto';
import { UpdateProductDto } from 'src/common/dtos/product/update-product.dto';
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
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { FileUtil } from 'src/common/utils/files.util';

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
    return await this.transactionUtil.runInTransaction(
      this.dataSource,
      async (queryRunner: QueryRunner) => {
        const categoryRepository = queryRunner.manager.getRepository(Category);
        const category = await categoryRepository.findOne({ where: { id: createProductDto.categoryId } });

        // 1. 제품 생성
        const productRepository = queryRunner.manager.getRepository(Product);

        const product = productRepository.create({ ...createProductDto, category });
        const savedProduct = await productRepository.save(product);

        // 2. 이미지 처리
        if (createProductDto.productImages && createProductDto.productImages.length > 0) {
          const productImagesRepository = queryRunner.manager.getRepository(ProductImages);
          const imageEntities = createProductDto.productImages.map((file, index) =>
            productImagesRepository.create({
              product: savedProduct,
              url: file.path,
              altText: file.originalname,
              isMain: index === 0, // 첫 번째 이미지를 메인으로 설정
            })
          );
          await productImagesRepository.save(imageEntities);
        }

        // 3. 할인 정보 처리
        if (createProductDto.discount) {
          const { type, discountRate, fixedAmount } = createProductDto.discount;

          if (type === ProductDiscountType.PERCENTAGE && !discountRate) {
            throw new Error('DiscountRate is required for PERCENTAGE type discounts.');
          }
          if (type === ProductDiscountType.FIXED_AMOUNT && !fixedAmount) {
            throw new Error('Value is required for FIXED type discounts.');
          }

          if (type === ProductDiscountType.PERCENTAGE) createProductDto.discount.fixedAmount = null;
          if (type === ProductDiscountType.FIXED_AMOUNT) createProductDto.discount.discountRate = null;

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
      },
      async (error) => {
        await FileUtil.deleteFiles(createProductDto.productImages.map((file) => file.path));
        console.log('Transaction rollback [이미지가 삭제 되었습니다.]', error.message);
      }
    );
  }

  // 지금 당장은 안 쓰이는 코드인데 나중에 리팩토링하면서 사용할 수 있도록 남겨둔다.
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
        url: `uploads/product-images/${file.filename}`,
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

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    await this.productRepository.remove(product);
  }

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['view', 'productTags', 'images', 'discounts', 'couponTargets', 'category'],
    });
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['view', 'productTags', 'images', 'discounts', 'couponTargets', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    product.view.viewCount += 1;
    product.view.lastViewedAt = new Date();
    await this.productViewRepository.save(product.view);

    return product;
  }

  async updateProduct(productId: string, updateData: UpdateProductDto): Promise<Product> {
    return this.transactionUtil.runInTransaction(this.dataSource, async (queryRunner: QueryRunner) => {
      const productRepository = queryRunner.manager.getRepository(Product);
      const productImagesRepository = queryRunner.manager.getRepository(ProductImages);
      const product = await productRepository.findOne({
        where: { id: productId },
        relations: ['productTags', 'images', 'discounts', 'category', 'priceHistories'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // 2. 기본 필드 업데이트
      Object.assign(product, {
        name: updateData.name ?? product.name,
        description: updateData.description ?? product.description,
        price: updateData.price ?? product.price,
        quantity: updateData.quantity ?? product.quantity,
        isFeatured: updateData.isFeatured ?? product.isFeatured,
        status: updateData.status ?? product.status,
      });

      // 3. 카테고리 업데이트
      if (updateData.categoryId) {
        const categoryRepository = await queryRunner.manager.getRepository(Category);
        const category = await categoryRepository.findOne({ where: { id: updateData.categoryId } });

        if (!category) {
          throw new NotFoundException(`Category with ID ${updateData.categoryId} not found.`);
        }

        product.category = category;
      }

      // 4. 이미지 삭제
      if (updateData.removeImageIds && updateData.removeImageIds.length > 0) {
        // 삭제할 이미지 가져오기
        const imagesToDelete = await productImagesRepository.find({
          where: { id: In(updateData.removeImageIds) },
        });

        if (imagesToDelete.length !== updateData.removeImageIds.length) {
          throw new NotFoundException('Some images not found.');
        }

        if (imagesToDelete.length > 0) {
          // 파일 삭제 처리
          for (const image of imagesToDelete) {
            if (image.url) {
              await FileUtil.deleteFile(image.url); // 파일 삭제 유틸리티 호출
            }
          }
          await productImagesRepository.delete({ id: In(updateData.removeImageIds) });
        }
      }

      // 5. 이미지 수정
      if (updateData.updateImages?.length) {
        for (const update of updateData.updateImages) {
          const image = await productImagesRepository.findOne({ where: { id: update.imageId } });
          if (!image) continue;
          await FileUtil.deleteFiles([image.url]); // 파일 삭제
          Object.assign(image, {
            altText: update.altText ?? image.altText,
            isMain: update.isMain ?? image.isMain,
          });
          await productImagesRepository.save(image);
        }
      }

      // 6. 새 이미지 추가
      if (updateData.newImages?.length) {
        const newImageEntities = updateData.newImages.map((imageUrl) =>
          productImagesRepository.create({
            product,
            url: imageUrl,
            altText: product.name,
          })
        );
        await productImagesRepository.save(newImageEntities);
      }

      // 7. 태그 업데이트
      if (updateData.tags) {
        const productTagsRepository = queryRunner.manager.getRepository(ProductTags);
        const tagRepository = queryRunner.manager.getRepository(Tag);

        if (updateData.tags.addTags) {
          const newTags = await Promise.all(
            updateData.tags.addTags.map(async (tagId) => {
              const tag = await tagRepository.findOne({ where: { id: tagId } });
              if (!tag) {
                throw new NotFoundException(`Tag with ID ${tagId} not found`);
              }

              const existingProductTag = await productTagsRepository.findOne({
                where: { product: { id: product.id }, tag: { id: tag.id } },
              });
              if (existingProductTag) {
                throw new BadRequestException(`Tag with ID ${tagId} already exists in product.`);
              }

              return productTagsRepository.create({ product, tag });
            })
          );

          await productTagsRepository.save(newTags);
        }

        if (updateData.tags.removeTags) {
          await Promise.all(
            updateData.tags.removeTags.map(async (tagId) => {
              const tag = await tagRepository.findOne({ where: { id: tagId } });
              if (!tag) {
                throw new NotFoundException(`Tag with ID ${tagId} not found`);
              }
            })
          );

          await productTagsRepository.delete({
            product: { id: product.id }, // 명시적으로 product.id를 사용
            tag: In(updateData.tags.removeTags),
          });
        }
      }

      // 8. 할인 정보 업데이트
      if (updateData.discount) {
        const productDiscountRepository = queryRunner.manager.getRepository(ProductDiscount);
        await productDiscountRepository.update(
          { product: { id: product.id }, isActive: true },
          { isActive: false, endDate: new Date(), product: { id: product.id } }
        );

        const discount = productDiscountRepository.create({
          ...updateData.discount,
          product,
        });
        await productDiscountRepository.save(discount);
      }

      // 가격 기록 생성
      if (product.priceHistories) {
        const productPriceHistoryRepository = queryRunner.manager.getRepository(ProductPriceHistory);
        const ExistingPriceHistory = product.priceHistories.find((history) => history.endDate == null);
        if (ExistingPriceHistory) {
          ExistingPriceHistory.endDate = new Date();
          await productPriceHistoryRepository.save(ExistingPriceHistory);
        }
        const priceHistory = productPriceHistoryRepository.create({
          product,
          price: product.price,
          startDate: new Date(),
        });
        await productPriceHistoryRepository.save(priceHistory);
      }

      return product;
    });
  }
}
