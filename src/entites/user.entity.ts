import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocalAccount } from './local-account.entity';
import { Address } from './address.entity';
import { RefreshToken } from './refresh-token.entity';
import { SocialAccount } from './social-account.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  profileImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => LocalAccount, (localAccount) => localAccount.user)
  localAccount: LocalAccount;

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;
}
