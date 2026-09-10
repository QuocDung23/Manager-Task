import { ZodValidationSchema } from "@/common";
import { TaskStatusAction } from "@prisma/client";
import z from "zod";

const taskStatusActionValues = Object.values(TaskStatusAction) as [
  TaskStatusAction,
  ...TaskStatusAction[],
];

export class UpdateTaskStatusActionRequestDto {
  taskId: string;
  statusAction: TaskStatusAction;

  constructor(data: UpdateTaskStatusActionRequestDto) {
    this.taskId = data.taskId;
    this.statusAction = data.statusAction;
  }
}

export const updateTaskStatusActionRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const updateTaskStatusActionRequestBodySchema = z
  .object({
    statusAction: z.enum(taskStatusActionValues),
  })
  .strict();

export const updateTaskStatusActionRequestValidationSchema: ZodValidationSchema =
  {
    params: updateTaskStatusActionRequestParamsSchema,
    body: updateTaskStatusActionRequestBodySchema,
  };

export const updateTaskStatusActionRequestSchema = {
  params: updateTaskStatusActionRequestParamsSchema,
  body: {
    description:
      "Update the execution status action of a task. Only members currently assigned to the task can change this value.",
    content: {
      "application/json": {
        schema: updateTaskStatusActionRequestBodySchema,
      },
    },
  },
};
