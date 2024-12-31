import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Orders } from './orders.entity';
import { Product } from './product.entity';

@Entity()
export class OrderDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orders, (order) => order.orderDetails, { onDelete: 'CASCADE' })
  order: Orders; // 주문과의 관계

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  product: Product; // 주문된 상품

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // 단가

  @Column()
  quantity: number; // 수량
}
