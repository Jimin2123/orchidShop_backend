import { Logger } from 'typeorm';
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as path from 'path';
import { ClsServiceManager } from 'nestjs-cls';

@Injectable()
export class TypeOrmLogger implements Logger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, elapsedTime }) => {
          const clsService = ClsServiceManager.getClsService();
          const traceId = clsService?.get('traceId');
          const userId = clsService?.get('userId');
          const userRole = clsService?.get('userRole');

          const traceIdPart = traceId ? `[${traceId}]` : '';
          const userPart = userId && userRole ? `[${userRole}-${userId}]` : '';

          return `[${timestamp}] [TypeORM] [${level.toUpperCase()}] [${elapsedTime}ms] ${traceIdPart} ${userPart} ${message}`;
        })
      ),
      transports: [
        new winstonDaily({
          level: 'debug',
          datePattern: 'YYYY-MM-DD',
          dirname: path.join(__dirname, '../../logs/typeorm'),
          filename: `%DATE%.typeorm.log`,
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ],
    });
  }

  private getClsContext() {
    const clsService = ClsServiceManager.getClsService();
    return {
      traceId: clsService?.get('traceId'),
      userId: clsService?.get('userId'),
      userRole: clsService?.get('userRole'),
    };
  }

  logQuery(query: string, parameters?: any[]) {
    const startTime = Date.now();
    const { traceId, userId, userRole } = this.getClsContext();
    const ignoredQueries = ['INFORMATION_SCHEMA', 'SHOW FULL TABLES', 'SCHEMATA', 'SELECT DATABASE() AS `db_name`'];
    if (ignoredQueries.some((pattern) => query.includes(pattern))) {
      return;
    }

    const logLevel = query.trim().startsWith('SELECT') ? 'debug' : 'info';
    const logExecutionTime = () => {
      const elapsedTime = Math.max(Date.now() - startTime, 0); // 최소값 0ms
      this.logger.log(logLevel, `Query executed: ${query} - Parameters: ${JSON.stringify(parameters)}`, {
        elapsedTime,
        traceId,
        userId,
        userRole,
      });
    };

    process.nextTick(logExecutionTime);
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    const startTime = Date.now();
    const { traceId, userId, userRole } = this.getClsContext();
    const logExecutionTime = () => {
      const elapsedTime = Date.now() - startTime;
      const errorType = error.includes('Duplicate entry') ? 'CONSTRAINT_ERROR' : 'GENERAL_ERROR';

      this.logger.error(`Query failed: ${query} - Parameters: ${JSON.stringify(parameters)} - Error: ${error}`, {
        errorType,
        elapsedTime,
        traceId,
        userId,
        userRole,
        stack: new Error().stack,
      });
    };

    process.nextTick(logExecutionTime);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const { traceId, userId, userRole } = this.getClsContext();
    const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);
    if (time > slowQueryThreshold) {
      this.logger.warn(`Slow query (${time}ms): ${query} - Parameters: ${JSON.stringify(parameters)}`, {
        elapsedTime: time,
        traceId,
        userId,
        userRole,
      });
    }
  }

  logSchemaBuild(message: string) {
    const startTime = Date.now();
    const { traceId, userId, userRole } = this.getClsContext();
    const logExecutionTime = () => {
      const elapsedTime = Date.now() - startTime;
      this.logger.info(`Schema build: ${message}`, { elapsedTime, traceId, userId, userRole });
    };

    process.nextTick(logExecutionTime);
  }

  logMigration(message: string) {
    const startTime = Date.now();
    const { traceId, userId, userRole } = this.getClsContext();
    const logExecutionTime = () => {
      const elapsedTime = Date.now() - startTime;
      this.logger.info(`Migration: ${message}`, { elapsedTime, traceId, userId, userRole });
    };

    process.nextTick(logExecutionTime);
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    const startTime = Date.now();
    const { traceId, userId, userRole } = this.getClsContext();
    const logExecutionTime = () => {
      const elapsedTime = Date.now() - startTime;
      if (level === 'log') {
        this.logger.info(message, { elapsedTime, traceId, userId, userRole });
      } else if (level === 'info') {
        this.logger.info(message, { elapsedTime, traceId, userId, userRole });
      } else if (level === 'warn') {
        this.logger.warn(message, { elapsedTime, traceId, userId, userRole });
      }
    };

    process.nextTick(logExecutionTime);
  }
}
