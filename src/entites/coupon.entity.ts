import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CouponRedemption } from './coupon-redemption.entity';
import { CouponTarget } from './coupon-target.entity';
import { UserGrade } from 'src/common/enums/user-grade.enum';
import { CouponType } from 'src/common/enums/coupon-type.enum';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // 쿠폰 코드

  @Column({
    type: 'enum',
    enum: CouponType,
    default: CouponType.PERCENTAGE, // 기본값 추가
  })
  type: CouponType; // 쿠폰 타입 (퍼센트 또는 고정 금액)

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number; // 최소 구매 금액

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  maxDiscountAmount: number; // 최대 할인 금액

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  usageLimit?: number; // 쿠폰 사용 가능 횟수 (null = 무제한)

  @Column({ default: 0 })
  usedCount: number;

  // 특정 등급에만 적용되는 쿠폰 (null일 경우 모든 사용 가능)
  @Column({ type: 'enum', enum: UserGrade, nullable: true })
  appliesToGrade?: UserGrade;

  @OneToMany(() => CouponRedemption, (redemption) => redemption.coupon)
  redemptions: CouponRedemption[];

  @OneToMany(() => CouponTarget, (target) => target.coupon)
  targets: CouponTarget[];
}
