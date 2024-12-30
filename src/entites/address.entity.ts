import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'isDefault'])
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string; // 주소

  @Column()
  detailAddress: string; // 상세주소

  @Column()
  zipCode: string; // 우편번호

  @Column()
  city: string; // 도시

  @Column()
  state: string; // 도/시/군

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  // 기본 주소 설정 메서드
  setDefaultAddress(): void {
    this.isDefault = true;
  }

  // 기본 주소 해제 메서드
  unsetDefaultAddress(): void {
    this.isDefault = false;
  }
}
