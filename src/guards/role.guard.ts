import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CustomWinstonLogger } from 'src/logger/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly context = RolesGuard.name;
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: CustomWinstonLogger
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true; // 역할 제한이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role || !roles.includes(user.role)) {
      this.logger.error(`Forbidden access: 접근 권한이 없는 사용자가 접근하려고함.`, this.context);
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return true; // 역할이 매치되면 통과
  }
}
