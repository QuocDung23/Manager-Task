import { ZodValidationSchema } from "@/common";
import z from "zod";

export class ClearTaskScheduleRequestDto {
  taskId: string;
  reason?: string;

  constructor(data: ClearTaskScheduleRequestDto) {
    this.taskId = data.taskId;
    this.reason = data.reason;
  }
}

export const clearTaskScheduleRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const clearTaskScheduleRequestBodySchema = z
  .object({
    reason: z.string().trim().max(1000).optional(),
  })
  .strict();

export const clearTaskScheduleRequestValidationSchema: ZodValidationSchema = {
  params: clearTaskScheduleRequestParamsSchema,
  body: clearTaskScheduleRequestBodySchema.optional(),
};

export const clearTaskScheduleRequestSchema = {
  params: clearTaskScheduleRequestParamsSchema,
  body: {
    description: "Clear task schedule",
    content: {
      "application/json": {
        schema: clearTaskScheduleRequestBodySchema,
      },
    },
  },
};
