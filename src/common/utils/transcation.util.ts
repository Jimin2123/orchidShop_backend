import { DataSource, QueryRunner } from 'typeorm';

/**
 * 트랜잭션 유틸리티 함수
 * @param dataSource - TypeORM 데이터 소스
 * @param work - 트랜잭션 내에서 실행할 작업 함수
 * @returns 작업 결과
 */
export async function runInTransaction<T>(
  dataSource: DataSource,
  work: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  try {
    // 1. QueryRunner 연결
    await queryRunner.connect();

    // 2. 트랜잭션 시작
    await queryRunner.startTransaction();

    try {
      // 3. 작업 수행
      const result = await work(queryRunner);

      // 4. 결과 검증
      if (result === null || (typeof result === 'object' && Object.keys(result).length === 0)) {
        throw new Error(`Transaction failed: Work returned invalid or empty data. Context: ${JSON.stringify(result)}`);
      }

      // 5. 트랜잭션 커밋
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      // 6. 트랜잭션 롤백
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed. Rollback initiated.', {
        message: error.message || error,
        stack: error.stack || '',
      });
      throw new Error(`Transaction failed: ${error.message}`);
    }
  } catch (connectError) {
    // 7. QueryRunner 연결 실패 처리
    console.error('Failed to connect QueryRunner.', {
      message: connectError.message || connectError,
      stack: connectError.stack || '',
    });
    throw new Error(`Failed to connect QueryRunner: ${connectError.message}`);
  } finally {
    // 8. QueryRunner 해제 처리
    try {
      if (queryRunner.isReleased === false) {
        await queryRunner.release();
      }
    } catch (releaseError) {
      console.error('Failed to release QueryRunner.', {
        message: releaseError.message || releaseError,
        stack: releaseError.stack || '',
      });
      throw new Error(`Failed to release QueryRunner: ${releaseError.message}`);
    }
  }
}
