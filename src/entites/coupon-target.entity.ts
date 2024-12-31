import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { UserGrade } from 'src/common/enums/user-grade.enum';
import { Product } from './product.entity';
import { Category } from './categories.entity';
import { User } from './user.entity';

@Entity()
export class CouponTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.targets, { onDelete: 'CASCADE' })
  coupon: Coupon;

  @Column({ type: 'enum', enum: ['PRODUCT', 'CATEGORY', 'USER', 'GLOBAL'] })
  appliesTo: 'PRODUCT' | 'CATEGORY' | 'USER' | 'GLOBAL';

  // 특정 등급에만 사용 가능한 경우
  @Column({ type: 'enum', enum: UserGrade, nullable: true })
  grade?: UserGrade;

  // 상품 관계
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  product?: Product;

  // 카테고리 관계
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  // 사용자 관계
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User;
}
