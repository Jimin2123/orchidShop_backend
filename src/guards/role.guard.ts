import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true; // 역할 제한이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role || !roles.includes(user.role)) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return true; // 역할이 매치되면 통과
  }
}
