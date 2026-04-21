import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

const uploadPath = './uploads';

// ✅ Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.includes('pdf')) {
      return cb(
        new BadRequestException('Only PDF files are allowed'),
        false,
      );
    }
    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};