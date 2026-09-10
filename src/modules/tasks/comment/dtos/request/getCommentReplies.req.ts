import { ZodValidationSchema } from "@/common";
import z from "zod";

export class GetCommentRepliesRequestDto {
  taskId: string;
  commentId: string;
  cursor?: string;
  limit: number;

  constructor(data: GetCommentRepliesRequestDto) {
    this.taskId = data.taskId;
    this.commentId = data.commentId;
    this.cursor = data.cursor;
    this.limit = data.limit;
  }
}

export const getCommentRepliesRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    commentId: z.string().uuid(),
  })
  .strict();

export const getCommentRepliesRequestQuerySchema = z
  .object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
  })
  .strict();

export const getCommentRepliesRequestValidationSchema: ZodValidationSchema = {
  params: getCommentRepliesRequestParamsSchema,
  query: getCommentRepliesRequestQuerySchema,
};

export const getCommentRepliesRequestSchema = {
  params: getCommentRepliesRequestParamsSchema,
  query: getCommentRepliesRequestQuerySchema,
};
