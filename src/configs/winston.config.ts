import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as path from 'path';
import { ClsServiceManager } from 'nestjs-cls';

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs'); // 환경 변수로 관리

// 공통 포맷
const logFormat = winston.format.printf(({ timestamp, level, context, message }) => {
  const clsService = ClsServiceManager.getClsService();
  const traceId = clsService?.get('traceId');
  const userId = clsService?.get('userId');
  const userRole = clsService?.get('userRole');

  const traceIdPart = traceId ? `[${traceId}]` : '';
  const userPart = userId && userRole ? `[${userRole}-${userId}]` : '';

  return `[${timestamp}] [${context}] [${level.toUpperCase()}] ${traceIdPart}${userPart}: ${message}`;
});

// 파일 포맷
const fileFormat: winston.Logform.Format = winston.format.combine(winston.format.timestamp(), logFormat);

// 콘솔 포맷
const consoleFormat: winston.Logform.Format = winston.format.combine(winston.format.timestamp(), logFormat);

// 일별 로테이션 옵션
const dailyOptions = (level: string): winstonDaily.DailyRotateFileTransportOptions => ({
  level,
  datePattern: 'YYYY-MM-DD',
  dirname: path.join(LOG_DIR, level), // 레벨별 폴더 생성
  filename: `%DATE%.${level}.log`,
  maxFiles: '30d',
  zippedArchive: true,
  handleExceptions: true,
  format: fileFormat,
});

// 콘솔 출력 옵션
const consoleOptions: winston.transports.ConsoleTransportOptions = {
  level: 'debug', // 개발 환경에서는 debug 이상 출력
  handleExceptions: true,
  format: consoleFormat,
};

// Winston 설정
export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console(consoleOptions), // 콘솔 출력
    new winstonDaily(dailyOptions('info')), // 파일 출력 (info)
    new winstonDaily(dailyOptions('warn')), // 파일 출력 (warn)
    new winstonDaily(dailyOptions('error')), // 파일 출력 (error)
  ],
  exceptionHandlers: [
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: path.join(LOG_DIR, 'exceptions'),
      filename: `%DATE%.exceptions.log`,
      maxFiles: '30d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
};
