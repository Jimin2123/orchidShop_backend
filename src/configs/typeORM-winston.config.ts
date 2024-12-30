import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';
import * as path from 'path';
import { ClsServiceManager } from 'nestjs-cls';

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs/typeorm'); // 환경 변수로 관리

// 일별 로테이션 옵션
export const dailyOptions = (level: string): winstonDaily.DailyRotateFileTransportOptions => ({
  level,
  datePattern: 'YYYY-MM-DD',
  dirname: path.join(LOG_DIR, level), // 레벨별 폴더 생성
  filename: `%DATE%.${level}-typeorm.log`,
  maxFiles: '30d',
  zippedArchive: true,
  handleExceptions: true,
  format: fileFormat,
});

export const fileFormat: winston.Logform.Format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, elapsedTime }) => {
    const clsService = ClsServiceManager.getClsService();
    const traceId = clsService?.get('traceId');
    const userId = clsService?.get('userId');
    const userRole = clsService?.get('userRole');

    const traceIdPart = traceId ? `[${traceId}]` : '';
    const userPart = userId && userRole ? `[${userRole}-${userId}]` : '';
    return `[${timestamp}] [TypeORM] [${level.toUpperCase()}] [${elapsedTime}ms] ${traceIdPart}${userPart} ${message}`;
  })
);
