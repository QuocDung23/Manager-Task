import { ZodValidationSchema } from "@/common";
import z from "zod";

export class UnlockTaskRequestDto {
  taskId: string;
  reason: string;

  constructor(data: UnlockTaskRequestDto) {
    this.taskId = data.taskId;
    this.reason = data.reason;
  }
}

export const unlockTaskRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const unlockTaskRequestBodySchema = z
  .object({
    reason: z.string().trim().min(1).max(1000),
  })
  .strict();

export const unlockTaskRequestValidationSchema: ZodValidationSchema = {
  params: unlockTaskRequestParamsSchema,
  body: unlockTaskRequestBodySchema,
};

export const unlockTaskRequestSchema = {
  params: unlockTaskRequestParamsSchema,
  body: {
    description: "Unlock a locked task",
    content: {
      "application/json": {
        schema: unlockTaskRequestBodySchema,
      },
    },
  },
};
