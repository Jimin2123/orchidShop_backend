import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { Orders } from './orders.entity';

@Entity()
@Index(['coupon', 'order', 'user'], { unique: true }) // 사용자 포함
export class CouponRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.redemptions, { onDelete: 'CASCADE' })
  coupon: Coupon;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Orders, { nullable: true, onDelete: 'SET NULL' })
  order?: Orders;

  @Column({ type: 'timestamp' })
  redeemedAt: Date;
}
