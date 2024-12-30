import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { hashPassword } from 'src/common/utils/hash.util';

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

  @Column({ default: false })
  isLocked: boolean; // 계정 잠금 상태

  @Column({ nullable: true })
  lockedAt: Date; // 계정 잠금 시간

  @OneToOne(() => User, (user) => user.localAccount, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // 비밀번호 암호화를 위한 메서드
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await hashPassword(this.password);
    }
  }

  /**
   * 계정 잠금 여부 확인 메서드
   * @returns {boolean} 계정 잠금 여부
   */
  isAccountLocked(): boolean {
    if (this.isLocked && this.lockedAt) {
      const lockDurations = [5, 15, 30]; // 단위: 분, 잠금 지속 시간 (예: 5분, 15분, 30분)
      const duration = lockDurations[Math.min(this.loginAttempt, lockDurations.length) - 1] || 30;
      const lockExpiry = new Date(this.lockedAt.getTime() + duration * 60 * 1000);
      if (new Date() > lockExpiry) {
        this.isLocked = false;
        this.lockedAt = null;
        this.loginAttempt = 0;
      }
    }
    return this.isLocked;
  }

  /**
   * 로그인 실패 처리 메서드
   * @param {number} maxAttempts 최대 시도 횟수
   * @returns {void}
   */
  handleFailedLogin(maxAttempts: number): void {
    this.loginAttempt += 1;
    if (this.loginAttempt >= maxAttempts) {
      this.isLocked = true;
      this.lockedAt = new Date();
    }
  }

  /**
   * 로그인 성공 처리 메서드
   * @returns {void}
   */
  resetLoginAttempts(): void {
    this.loginAttempt = 0;
    this.isLocked = false;
    this.lockedAt = null;
  }
}
