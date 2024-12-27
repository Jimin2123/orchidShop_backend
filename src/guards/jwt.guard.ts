import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = (await super.canActivate(context)) as boolean;
    return isActivated; // 요청이 통과되면 strategy의 validate 메서드에서 반환된 사용자 정보가 request.user에 저장됨
  }
}
