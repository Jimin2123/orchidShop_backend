import { Logger } from 'typeorm';
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { ClsServiceManager } from 'nestjs-cls';
import { typeOrmLogger } from 'src/configs/typeORM-winston.config';

// 로그에서 제외될 쿼리 목록
const ignoredQueries = [
  'INFORMATION_SCHEMA',
  'SHOW FULL TABLES',
  'SCHEMATA',
  'SELECT DATABASE() AS `db_name`',
  'SELECT VERSION() AS `version`',
  'All classes found using provided glob pattern',
  'Schema build:',
];

@Injectable()
export class TypeOrmLogger implements Logger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = typeOrmLogger;
  }

  private getClsContext(additionalFields = {}): Record<string, any> {
    const clsService = ClsServiceManager.getClsService();
    return {
      traceId: clsService?.get('traceId'),
      userId: clsService?.get('userId'),
      userRole: clsService?.get('userRole'),
      ...additionalFields, // 외부에서 추가 필드 주입
    };
  }

  // 에러가 발생해도 서버가 멈추지 않도록 안전하게 실행
  private safeExecute<T>(callback: () => T, fallbackMessage: string): T | void {
    try {
      return callback();
    } catch (error) {
      this.logger.error(`${fallbackMessage}: ${error.message}`, {
        stack: error.stack,
      });
    }
  }

  logQuery(query: string, parameters?: any[]) {
    this.safeExecute(() => {
      const startTime = Date.now();
      const { traceId, userId, userRole } = this.getClsContext();

      if (ignoredQueries.some((pattern) => query.includes(pattern))) {
        return;
      }

      const logLevel = query.trim().startsWith('SELECT') ? 'debug' : 'info';
      const elapsedTime = this.calculateElapsedTime(startTime);

      // Parameters 처리
      const formattedParameters = parameters ? JSON.stringify(parameters) : 'N/A';

      this.logger.log(logLevel, `Query executed: ${query} - Parameters: ${formattedParameters}`, {
        elapsedTime,
        traceId,
        userId,
        userRole,
      });
    }, 'Failed to log query');
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    this.safeExecute(() => {
      const startTime = Date.now();
      const { traceId, userId, userRole } = this.getClsContext();

      const elapsedTime = this.calculateElapsedTime(startTime);
      const formattedParameters = parameters ? JSON.stringify(parameters) : 'N/A';
      const errorType = error.includes('Duplicate entry') ? 'CONSTRAINT_ERROR' : 'GENERAL_ERROR';

      this.logger.error(`Query failed: ${query} - Parameters: ${formattedParameters} - Error: ${error}`, {
        errorType,
        elapsedTime,
        traceId,
        userId,
        userRole,
        stack: new Error().stack,
      });
    }, 'Failed to log query error');
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.safeExecute(() => {
      const { traceId, userId, userRole } = this.getClsContext();
      const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);
      if (time > slowQueryThreshold) {
        this.logger.warn(`Slow query (${time}ms): ${query} - Parameters: ${JSON.stringify(parameters)}`, {
          elapsedTime: Math.max(time, 0), // 최소값 0ms 보장
          traceId,
          userId,
          userRole,
        });
      }
    }, 'Failed to log slow query');
  }

  logSchemaBuild(message: string) {
    this.safeExecute(() => {
      const startTime = Date.now();
      const { traceId, userId, userRole } = this.getClsContext();
      const elapsedTime = this.calculateElapsedTime(startTime);
      this.logger.info(`Schema build: ${message}`, { elapsedTime, traceId, userId, userRole });
    }, 'Failed to log schema build');
  }

  logMigration(message: string) {
    this.safeExecute(() => {
      const startTime = Date.now();
      const { traceId, userId, userRole } = this.getClsContext();
      const elapsedTime = this.calculateElapsedTime(startTime);
      this.logger.info(`Migration: ${message}`, { elapsedTime, traceId, userId, userRole });
    }, 'Failed to log migration');
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    this.safeExecute(() => {
      const startTime = Date.now();
      const { traceId, userId, userRole } = this.getClsContext();
      const elapsedTime = this.calculateElapsedTime(startTime);
      if (level === 'log') {
        this.logger.info(message, { elapsedTime, traceId, userId, userRole });
      } else if (level === 'info') {
        this.logger.info(message, { elapsedTime, traceId, userId, userRole });
      } else if (level === 'warn') {
        this.logger.warn(message, { elapsedTime, traceId, userId, userRole });
      }
    }, 'Failed to log generic message');
  }

  private calculateElapsedTime(startTime: number): number {
    return Math.max(Date.now() - startTime, 0);
  }
}
