import * as fs from 'fs/promises';
import * as path from 'path';

export class FileUtil {
  /**
   * 파일 삭제 유틸리티
   * @param filePath - 삭제할 파일의 경로
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      await fs.unlink(fullPath);
      console.log(`File deleted successfully: ${fullPath}`);
    } catch (error) {
      console.warn(`Failed to delete file: ${filePath}. Error: ${error.message}`);
    }
  }
}
