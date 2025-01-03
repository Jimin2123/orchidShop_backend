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

  /**
   * 파일 읽기 유틸리티
   * @param filePath - 읽을 파일의 경로
   * @returns 파일 내용
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.resolve(filePath);
      const data = await fs.readFile(fullPath, 'utf-8');
      return data;
    } catch (error) {
      console.warn(`Failed to read file: ${filePath}. Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 파일 쓰기 유틸리티
   * @param filePath - 쓸 파일의 경로
   * @param data - 파일에 쓸 데이터
   */
  static async writeFile(filePath: string, data: string): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      await fs.writeFile(fullPath, data, 'utf-8');
      console.log(`File written successfully: ${fullPath}`);
    } catch (error) {
      console.warn(`Failed to write file: ${filePath}. Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 디렉토리 생성 유틸리티
   * @param dirPath - 생성할 디렉토리의 경로
   */
  static async createDirectory(dirPath: string): Promise<void> {
    try {
      const fullPath = path.resolve(dirPath);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`Directory created successfully: ${fullPath}`);
    } catch (error) {
      console.warn(`Failed to create directory: ${dirPath}. Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 파일 존재 여부 확인 유틸리티
   * @param filePath - 확인할 파일의 경로
   * @returns 파일 존재 여부
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
