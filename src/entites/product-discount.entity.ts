import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductDiscountType } from 'src/common/enums/product-discount.enum';
import { DiscountAppliesTo } from 'src/common/enums/product-discount-applies-to.enum';

@Entity()
export class ProductDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.discounts)
  product: Product;

  @Column({ type: 'enum', enum: ProductDiscountType, default: ProductDiscountType.PERCENTAGE })
  type: ProductDiscountType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discountRate: number; // 할인율

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: DiscountAppliesTo, nullable: true })
  appliesTo: DiscountAppliesTo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
