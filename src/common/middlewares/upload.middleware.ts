import { Exception } from "@tsed/exceptions";
import { Request } from "express";
import multer from "multer";

//cấu hình lưu trữ ở ram
const storage = multer.memoryStorage();

//validate định dạng ảnh
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/png",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Exception(400, "Invalid file type"));
  }
};

export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    }
})
