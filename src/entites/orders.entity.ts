import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { OrderDetails } from './order-details.entity';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User; // 주문을 한 사용자

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number; // 총 금액

  @Column({ type: 'enum', enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'], default: 'PENDING' })
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'; // 주문 상태

  @Column({ nullable: true })
  paymentMethod: string; // 결제 방식 (예: 'CREDIT_CARD', 'PAYPAL')

  @Column({ nullable: true })
  paymentId: string; // 외부 결제 시스템에서의 결제 ID

  @ManyToOne(() => Coupon, { nullable: true, onDelete: 'SET NULL' })
  coupon?: Coupon; // 적용된 쿠폰과의 관계

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderDetails, (orderDetails) => orderDetails.order, { cascade: true })
  orderDetails: OrderDetails[]; // 주문 상세와의 관계
}
