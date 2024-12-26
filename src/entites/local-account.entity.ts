import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  loginAttempt: number;

  @OneToOne(() => User, (user) => user.localAccount, { onDelete: 'CASCADE' })
  user: User;
}
