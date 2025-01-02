import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tag } from './tag.entity';
import { Product } from './product.entity';

@Entity()
export class ProductTags {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.productTags, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Tag, (tag) => tag.productTags)
  tag: Tag;
}
