import { ZodValidationSchema } from "@/common";
import z from "zod";

export class AssignTaskRequestDto {
  taskId: string;
  userIds: string[];

  constructor(data: AssignTaskRequestDto) {
    this.taskId = data.taskId;
    this.userIds = data.userIds;
  }
}

export const assignTaskRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const assignTaskRequestBodySchema = z
  .object({
    userIds: z.array(z.string().uuid()).min(1),
  })
  .strict()
  .refine((data) => new Set(data.userIds).size === data.userIds.length, {
    message: "userIds contains duplicates",
    path: ["userIds"],
  });

export const assignTaskRequestValidationSchema: ZodValidationSchema = {
  body: assignTaskRequestBodySchema,
  params: assignTaskRequestParamsSchema,
};

export const assignTaskRequestSchema = {
  params: assignTaskRequestParamsSchema,
  body: {
    description:
      "Replace the list of assignees for a task. All provided userIds must be active board members of the board containing this task. Behavior is replace-all: assignees not in `userIds` will be unassigned.",
    content: {
      "application/json": {
        schema: assignTaskRequestBodySchema,
      },
    },
  },
};