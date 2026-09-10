import { ZodValidationSchema } from "@/common";
import z from "zod";

export class UnassignTaskRequestDto {
  taskId: string;
  userId: string;

  constructor(data: UnassignTaskRequestDto) {
    this.taskId = data.taskId;
    this.userId = data.userId;
  }
}

export const unassignTaskRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    userId: z.string().uuid(),
  })
  .strict();

export const unassignTaskRequestValidationSchema: ZodValidationSchema = {
  params: unassignTaskRequestParamsSchema,
};

export const unassignTaskRequestSchema = {
  params: unassignTaskRequestParamsSchema,
};