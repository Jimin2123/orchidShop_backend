import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProductTags } from './product-tags.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToMany(() => ProductTags, (productTags) => productTags.tag)
  productTags: ProductTags[];

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
