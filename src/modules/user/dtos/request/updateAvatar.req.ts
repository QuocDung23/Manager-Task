import { ZodValidationSchema } from "@/common";
import z from "zod";

const allowedAvatarMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const updateAvatarRequestFileSchema = z
  .object({
    fieldname: z.literal("avatar"),
    originalname: z.string().min(1),
    mimetype: z.enum(allowedAvatarMimeTypes),
    size: z.number().positive().max(5 * 1024 * 1024),
  })
  .passthrough();

export const updateAvatarRequestValidationSchema: ZodValidationSchema = {
  file: updateAvatarRequestFileSchema,
};

export const updateAvatarRequestBodySchema = {
  content: {
    "multipart/form-data": {
      schema: z.object({
        avatar: z
          .string()
          .openapi({ type: "string", format: "binary", description: "Avatar image file" }),
      }),
    },
  },
};
