import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomWinstonLogger } from 'src/logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly context = 'LoggingMiddleware';

  constructor(private readonly logger: CustomWinstonLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const start = process.hrtime();

    // 요청 시작 로깅
    this.logger.log(
      `Incoming request: ${method} ${originalUrl} from ${clientIp} (User-Agent: ${userAgent})`,
      this.context
    );

    // 요청 본문 크기 계산
    const requestSize = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const elapsed = (seconds * 1e3 + nanoseconds / 1e6).toFixed(3);
      const { statusCode } = res;
      const responseSize = res.getHeader('content-length') || 'unknown';

      // 상태 코드별 로깅
      if (statusCode >= 100 && statusCode < 400) {
        this.logger.log(
          `Request completed: ${method} ${originalUrl} ${statusCode} - ${elapsed}ms, requestSize=${requestSize}B, responseSize=${responseSize}B`,
          this.context
        );
      } else if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(
          `Client error: ${method} ${originalUrl} ${statusCode} - ${elapsed}ms, requestSize=${requestSize}B, responseSize=${responseSize}B`,
          this.context
        );
      } else if (statusCode >= 500) {
        this.logger.error(
          `Server error: ${method} ${originalUrl} ${statusCode} - ${elapsed}ms, requestSize=${requestSize}B, responseSize=${responseSize}B`,
          this.context
        );
      }
    });

    res.on('error', (err) => {
      this.logger.error(`Request error: ${method} ${originalUrl} - ${err.message}`, this.context);
    });

    try {
      next();
    } catch (err) {
      this.logger.error(`Middleware error: ${method} ${originalUrl} - ${err.message}`, this.context);
    }
  }
}
