import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LocalAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: 0 })
  loginAttempt: number; // 로그인 시도 횟수

  @OneToOne(() => User, (user) => user.localAccount, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
