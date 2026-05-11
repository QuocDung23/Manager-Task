import cloudinary from "@/configs/cloudinary.config";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export class CloudinaryService {
  private uploadFromBuffer(
    buffer: Buffer,
    folder: string,
    options: Record<string, unknown> = {},
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const cldUploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          ...options,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (result) resolve(result);
          else reject(error);
        },
      );
      streamifier.createReadStream(buffer).pipe(cldUploadStream);
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    return this.uploadFromBuffer(
      file.buffer,
      "manage-task/avatars",
      {
        public_id: `avatar_${userId}`,
        overwrite: true,
        format: "jpg",
        transformation: [{ width: 300, height: 300, crop: "fill" }],
      },
    );
  }

  async uploadImage(file: Express.Multer.File) {
    return this.uploadFromBuffer(
      file.buffer,
      "manage-task/images",
    );
  }

  async deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
