import * as bcrypt from 'bcrypt';

/**
 * 패스워드 해싱하는 함수
 * @param password // 해싱할 패스워드
 * @returns hashedPassword
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 * 패스워드 비교하는 함수
 * @param plainPassword // 입력받은 패스워드
 * @param hashedPassword // DB에 저장된 패스워드
 * @returns true || false
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
