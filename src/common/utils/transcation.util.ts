import { Injectable } from '@nestjs/common';
import { TypeOrmLogger } from 'src/logger/typeorm-logger.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionUtil {
  constructor(private readonly logger: TypeOrmLogger) {}

  async runInTransaction<T>(
    dataSource: DataSource,
    work: (queryRunner: QueryRunner) => Promise<T>,
    onRollback?: (error: any) => Promise<void> // 롤백 시 실행할 콜백 함수 추가
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      this.logger.log('info', '트랜잭션 시작 중...');
      await queryRunner.connect();
      this.logger.log('info', 'QueryRunner 연결 성공.');

      await queryRunner.startTransaction();
      this.logger.log('info', '트랜잭션이 시작되었습니다.');

      const startTime = Date.now();

      try {
        this.logger.log('info', '트랜잭션 작업을 실행합니다.');
        const result = await work(queryRunner);

        if (result === undefined || result === null) {
          this.logger.logQueryError(
            '작업 결과 검증 실패',
            `결과가 유효하지 않습니다. Context: ${JSON.stringify(result)}`,
            []
          );
          throw new Error(`트랜잭션 실패: 작업 결과가 유효하지 않습니다.`);
        }

        const elapsedTime = Date.now() - startTime;
        this.logger.log('info', `트랜잭션 작업 종료. 소요 시간: ${elapsedTime}ms`);

        await queryRunner.commitTransaction();
        this.logger.log('info', '트랜잭션이 성공적으로 커밋되었습니다.');
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.logQueryError(
          error.message,
          `트랜잭션 롤백 실행됨. QueryRunner 상태: isTransactionActive=${queryRunner.isTransactionActive}`,
          []
        );

        // 롤백 시 콜백 함수 호출
        if (onRollback) await onRollback(error);

        throw new Error(`트랜잭션 실패: ${error.message}`);
      }
    } catch (connectError) {
      this.logger.logQueryError(connectError.message, 'QueryRunner 연결 실패', []);
      throw new Error(`QueryRunner 연결 실패: ${connectError.message}`);
    } finally {
      try {
        if (!queryRunner.isReleased) {
          await queryRunner.release();
          this.logger.log('info', 'QueryRunner가 성공적으로 해제되었습니다.');
        }
      } catch (releaseError) {
        this.logger.logQueryError(
          releaseError.message,
          `QueryRunner 해제 실패. QueryRunner 상태: isTransactionActive=${queryRunner.isTransactionActive}`,
          []
        );
        throw new Error(`QueryRunner 해제 실패: ${releaseError.message}`);
      }
    }
  }
}
