import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { CouponTarget } from './coupon-target.entity';

@Entity()
@Tree('closure-table') // 계층적 구조를 관리하기 위한 설정
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @TreeChildren()
  children: Category[]; // 하위 카테고리

  @TreeParent()
  parent: Category; // 상위 카테고리

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @OneToMany(() => CouponTarget, (couponTarget) => couponTarget.category)
  couponTargets: CouponTarget[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
