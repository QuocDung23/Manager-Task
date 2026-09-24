import { ZodValidationSchema } from "@/common";
import { ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_SIZE } from "@/common/constants";
import z from "zod";

export const updateAvatarRequestFileSchema = z
  .object({
    fieldname: z.literal("avatar"),
    originalname: z.string().min(1),
    mimetype: z.enum(ALLOWED_AVATAR_MIME_TYPES),
    size: z.number().positive().max(MAX_AVATAR_SIZE),
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
