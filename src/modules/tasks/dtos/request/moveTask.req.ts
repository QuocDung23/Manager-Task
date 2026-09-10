import { ZodValidationSchema } from "@/common";
import z from "zod";

export class MoveTaskRequestDto {
  taskId: string;
  sourceListId: string;
  targetListId: string;
  orderedTaskIds: string[];

  constructor(data: MoveTaskRequestDto) {
    this.taskId = data.taskId;
    this.sourceListId = data.sourceListId;
    this.targetListId = data.targetListId;
    this.orderedTaskIds = data.orderedTaskIds;
  }
}

export const moveTaskRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const moveTaskRequestBodySchema = z
  .object({
    sourceListId: z.string().uuid(),
    targetListId: z.string().uuid(),
    orderedTaskIds: z.array(z.string().uuid()).min(1),
  })
  .strict();

export const moveTaskRequestValidationSchema: ZodValidationSchema = {
  body: moveTaskRequestBodySchema,
  params: moveTaskRequestParamsSchema,
};

export const moveTaskRequestSchema = {
  params: moveTaskRequestParamsSchema,
  body: {
    description:
      "Move or reorder a task within a list or across lists. `orderedTaskIds` is the full list of active task ids in the target list after the move, in the new order.",
    content: {
      "application/json": {
        schema: moveTaskRequestBodySchema,
      },
    },
  },
};
