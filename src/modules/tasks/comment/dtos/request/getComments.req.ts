import { ZodValidationSchema } from "@/common";
import z from "zod";

export class GetCommentsRequestDto {
  taskId: string;
  cursor?: string;
  limit: number;
  includeReplies: boolean;

  constructor(data: GetCommentsRequestDto) {
    this.taskId = data.taskId;
    this.cursor = data.cursor;
    this.limit = data.limit;
    this.includeReplies = data.includeReplies;
  }
}

export const getCommentsRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const getCommentsRequestQuerySchema = z
  .object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
    includeReplies: z.coerce.boolean().default(false).optional(),
  })
  .strict();

export const getCommentsRequestValidationSchema: ZodValidationSchema = {
  params: getCommentsRequestParamsSchema,
  query: getCommentsRequestQuerySchema,
};

export const getCommentsRequestSchema = {
  params: getCommentsRequestParamsSchema,
  query: getCommentsRequestQuerySchema,
};
