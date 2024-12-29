import { DataSource, QueryRunner } from 'typeorm';

export async function runInTransaction<T>(
  dataSource: DataSource,
  work: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 작업 수행
    const result = await work(queryRunner);

    // 업데이트 값 검증
    if (result === null || (typeof result === 'object' && Object.keys(result).length === 0)) {
      throw new Error('Update operation returned invalid or empty data.');
    }

    // 성공적으로 작업이 완료되면 커밋
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    // 오류 발생 시 롤백
    await queryRunner.rollbackTransaction();
    console.error('Transaction failed. Rollback.', error.message || error);
    throw new Error(`Transaction failed: ${error.message}`);
  } finally {
    // QueryRunner 해제
    try {
      await queryRunner.release();
    } catch (releaseError) {
      console.error('Failed to release query runner.', releaseError);
      throw new Error(`Failed to release query runner: ${releaseError.message}`);
    }
  }
}
