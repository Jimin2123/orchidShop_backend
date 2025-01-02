import { Injectable } from '@nestjs/common';
import { TypeOrmLogger } from 'src/logger/typeorm-logger.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionUtil {
  constructor(private readonly logger: TypeOrmLogger) {}

  async runInTransaction<T>(dataSource: DataSource, work: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      this.logger.log('info', '트랜잭션 시작 중...');
      // 1. QueryRunner 연결
      await queryRunner.connect();
      this.logger.log('info', 'QueryRunner 연결 성공.');

      // 2. 트랜잭션 시작
      await queryRunner.startTransaction();
      this.logger.log('info', '트랜잭션이 시작되었습니다.');

      try {
        // 3. 작업 수행
        this.logger.log('info', '트랜잭션 작업을 실행합니다.');
        const result = await work(queryRunner);

        // 4. 결과 검증
        if (result === null || (typeof result === 'object' && Object.keys(result).length === 0)) {
          throw new Error(
            `트랜잭션 실패: 작업 결과가 유효하지 않거나 빈 데이터입니다. Context: ${JSON.stringify(result)}`
          );
        }

        // 5. 트랜잭션 커밋
        await queryRunner.commitTransaction();
        this.logger.log('info', '트랜잭션이 성공적으로 커밋되었습니다.');
        return result;
      } catch (error) {
        // 6. 트랜잭션 롤백
        await queryRunner.rollbackTransaction();
        this.logger.logQueryError(error.message, '트랜잭션 롤백 실행됨', []);

        throw new Error(`트랜잭션 실패: ${error.message}`);
      }
    } catch (connectError) {
      // 7. QueryRunner 연결 실패 처리
      this.logger.logQueryError(connectError.message, 'QueryRunner 연결 실패', []);
      throw new Error(`QueryRunner 연결 실패: ${connectError.message}`);
    } finally {
      // 8. QueryRunner 해제 처리
      try {
        if (queryRunner.isReleased === false) {
          await queryRunner.release();
          this.logger.log('info', 'QueryRunner가 성공적으로 해제되었습니다.');
        }
      } catch (releaseError) {
        this.logger.logQueryError(releaseError.message, 'QueryRunner 해제 실패', []);
        throw new Error(`QueryRunner 해제 실패: ${releaseError.message}`);
      }
    }
  }
}
