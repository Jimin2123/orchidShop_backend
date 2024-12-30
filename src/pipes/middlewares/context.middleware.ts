import { Injectable, NestMiddleware } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly clsService: ClsService) {}

  use(req: any, res: any, next: () => void) {
    this.clsService.run(() => {
      try {
        // Trace ID 생성 또는 가져오기
        const traceId = req.headers['x-trace-id'] || uuidv4();
        res.setHeader('x-trace-id', traceId);

        // 기본값 설정 (req.user가 없는 경우)
        const userId = null;
        const userRole = null;

        // 요청별 기본 컨텍스트 설정
        this.clsService.set('traceId', traceId);
        this.clsService.set('userId', userId);
        this.clsService.set('userRole', userRole);

        // IP 주소 추가
        const ipAddress =
          req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection?.remoteAddress || 'unknown';
        this.clsService.set('ipAddress', ipAddress);

        // 이후 미들웨어에서 req.user 설정 시 업데이트
        Object.defineProperty(req, 'clsService', {
          value: this.clsService,
          writable: false,
        });
      } catch (e) {
        console.error('Error in ContextMiddleware:', e);
      }

      next();
    });
  }
}
