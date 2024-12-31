import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImages {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;

  @Column()
  url: string;

  @Column()
  altText: string;

  @Column({ default: false })
  isMain: boolean;

  @Column({ default: 0 })
  order: number; // 이미지 순서 필드 추가

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
