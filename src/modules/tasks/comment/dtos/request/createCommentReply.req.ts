import { ZodValidationSchema } from "@/common";
import z from "zod";

const commentContentSchema = z.string().trim().min(1).max(2000);

export class CreateCommentReplyRequestDto {
  taskId: string;
  parentCommentId: string;
  userId: string;
  content: string;

  constructor(data: CreateCommentReplyRequestDto) {
    this.taskId = data.taskId;
    this.parentCommentId = data.parentCommentId;
    this.userId = data.userId;
    this.content = data.content;
  }
}

export const createCommentReplyRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    commentId: z.string().uuid(),
  })
  .strict();

export const createCommentReplyRequestBodySchema = z
  .object({
    content: commentContentSchema,
  })
  .strict();

export const createCommentReplyRequestValidationSchema: ZodValidationSchema = {
  body: createCommentReplyRequestBodySchema,
  params: createCommentReplyRequestParamsSchema,
};

export const createCommentReplyRequestSchema = {
  params: createCommentReplyRequestParamsSchema,
  body: {
    description: "Reply to a root task comment (1 level deep only).",
    content: {
      "application/json": {
        schema: createCommentReplyRequestBodySchema,
      },
    },
  },
};
