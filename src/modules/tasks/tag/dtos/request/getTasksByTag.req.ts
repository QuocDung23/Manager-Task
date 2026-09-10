import { ZodValidationSchema } from "@/common";
import { TaskStatus } from "@prisma/client";
import z from "zod";

const taskStatusValues = Object.values(TaskStatus) as [
  TaskStatus,
  ...TaskStatus[],
];

export class GetTasksByTagRequestDto {
  boardId: string;
  tagId: string;
  listId?: string;
  name?: string;
  status?: TaskStatus;

  constructor(data: GetTasksByTagRequestDto) {
    this.boardId = data.boardId;
    this.tagId = data.tagId;
    this.listId = data.listId;
    this.name = data.name;
    this.status = data.status;
  }
}

export const getTasksByTagRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
    tagId: z.string().uuid(),
  })
  .strict();

export const getTasksByTagRequestQuerySchema = z
  .object({
    listId: z.string().uuid().optional(),
    name: z.string().trim().optional(),
    status: z.enum(taskStatusValues).optional(),
  })
  .strict();

export const getTasksByTagRequestValidationSchema: ZodValidationSchema = {
  params: getTasksByTagRequestParamsSchema,
  query: getTasksByTagRequestQuerySchema,
};

export const getTasksByTagRequestSchema = {
  params: getTasksByTagRequestParamsSchema,
  query: getTasksByTagRequestQuerySchema,
};
