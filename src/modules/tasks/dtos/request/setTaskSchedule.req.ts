import { ZodValidationSchema } from "@/common";
import z from "zod";

export class SetTaskScheduleRequestDto {
  taskId: string;
  dueDate: Date;
  reminderAt?: Date;
  reason?: string;

  constructor(data: SetTaskScheduleRequestDto) {
    this.taskId = data.taskId;
    this.dueDate = new Date(data.dueDate);
    this.reminderAt = data.reminderAt
      ? new Date(data.reminderAt)
      : undefined;
    this.reason = data.reason;
  }
}

export const setTaskScheduleRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const setTaskScheduleRequestBodySchema = z
  .object({
    dueDate: z.coerce.date(),
    reminderAt: z.coerce.date().optional(),
    reason: z.string().trim().max(1000).optional(),
  })
  .strict();

export const setTaskScheduleRequestValidationSchema: ZodValidationSchema = {
  params: setTaskScheduleRequestParamsSchema,
  body: setTaskScheduleRequestBodySchema,
};

export const setTaskScheduleRequestSchema = {
  params: setTaskScheduleRequestParamsSchema,
  body: {
    description: "Set or reschedule task deadline",
    content: {
      "application/json": {
        schema: setTaskScheduleRequestBodySchema,
      },
    },
  },
};
