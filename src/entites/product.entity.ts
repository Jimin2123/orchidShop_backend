import { ProductStatus } from 'src/common/enums/product-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductImages } from './product-images.entity';
import ProductPriceHistory from './product-price-history.entity';
import { ProductDiscount } from './product-discount.entity';
import { ProductTags } from './product-tags.entity';
import { Category } from './categories.entity';
import { ProductView } from './product-view.entity';
import { CouponTarget } from './coupon-target.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: false })
  isFeatured: boolean;

  @OneToOne(() => ProductView, (productView) => productView.product)
  view: ProductView;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @OneToMany(() => ProductTags, (productTags) => productTags.product)
  productTags: ProductTags[];

  @OneToMany(() => ProductImages, (productImages) => productImages.product)
  images: ProductImages[];

  @OneToMany(() => ProductPriceHistory, (productPriceHistory) => productPriceHistory.product)
  priceHistories: ProductPriceHistory[];

  @OneToMany(() => ProductDiscount, (productDiscount) => productDiscount.product)
  discounts: ProductDiscount[];

  @OneToMany(() => CouponTarget, (couponTarget) => couponTarget.product)
  couponTargets: CouponTarget[];

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
