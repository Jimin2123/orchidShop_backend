import { IsOptional, IsString } from 'class-validator';

export class UpdateLocalAccountDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string; // 암호화는 Service에서 처리

  @IsOptional()
  lastLogin?: Date;

  @IsOptional()
  loginAttempt?: number;
}
