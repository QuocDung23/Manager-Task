import { ZodValidationSchema } from "@/common";
import z from "zod";

export class DetachTaskTagRequestDto {
  taskId: string;
  tagId: string;

  constructor(data: DetachTaskTagRequestDto) {
    this.taskId = data.taskId;
    this.tagId = data.tagId;
  }
}

export const detachTaskTagRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    tagId: z.string().uuid(),
  })
  .strict();

export const detachTaskTagRequestValidationSchema: ZodValidationSchema = {
  params: detachTaskTagRequestParamsSchema,
};

export const detachTaskTagRequestSchema = {
  params: detachTaskTagRequestParamsSchema,
};
