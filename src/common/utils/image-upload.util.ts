import { diskStorage } from 'multer';
import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
  }
};

export const editFileName = (req, file, callback) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
};

export const getStorageConfig = (destination: string, maxSizeMB: number) => ({
  storage: diskStorage({
    destination: `./uploads/${destination}`, // 저장 경로 동적 설정
    filename: editFileName,
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 }, // 동적 파일 크기 제한 설정
});
