import { Exception } from "@tsed/exceptions";
import { Request } from "express";
import multer from "multer";
import { ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_SIZE } from "@/common/constants";

// In-memory storage keeps the uploaded file available as a Buffer for Cloudinary uploads.
const storage = multer.memoryStorage();

// Reject any file whose MIME type is not in the shared avatar allow-list.
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes: ReadonlyArray<string> = ALLOWED_AVATAR_MIME_TYPES;
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
    fileSize: MAX_AVATAR_SIZE,
  },
});
