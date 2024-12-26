import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocalAccount } from './local-account.entity';
import { Address } from './address.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  nickName: string;

  @Column({ nullable: true })
  birth: Date;

  @Column({ default: true })
  gender: boolean;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profileImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => LocalAccount, (localAccount) => localAccount.user)
  @JoinColumn()
  localAccount: LocalAccount;

  @OneToMany(() => Address, (address) => address.user)
  @JoinColumn()
  addresses: Address[];

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  @JoinColumn()
  refreshToken: RefreshToken;
}
