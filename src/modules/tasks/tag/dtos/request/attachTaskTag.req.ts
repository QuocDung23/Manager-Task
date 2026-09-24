import { ZodValidationSchema } from "@/common";
import z from "zod";

export class AttachTaskTagRequestDto {
  taskId: string;
  tagId: string;

  constructor(data: AttachTaskTagRequestDto) {
    this.taskId = data.taskId;
    this.tagId = data.tagId;
  }
}

export const attachTaskTagRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    tagId: z.string().uuid(),
  })
  .strict();

export const attachTaskTagRequestValidationSchema: ZodValidationSchema = {
  params: attachTaskTagRequestParamsSchema,
};

export const attachTaskTagRequestSchema = {
  params: attachTaskTagRequestParamsSchema,
};
