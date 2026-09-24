import { ZodValidationSchema } from "@/common";
import z from "zod";

const commentContentSchema = z.string().trim().min(1).max(2000);

export class UpdateCommentRequestDto {
  taskId: string;
  commentId: string;
  userId: string;
  content: string;

  constructor(data: UpdateCommentRequestDto) {
    this.taskId = data.taskId;
    this.commentId = data.commentId;
    this.userId = data.userId;
    this.content = data.content;
  }
}

export const updateCommentRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    commentId: z.string().uuid(),
  })
  .strict();

export const updateCommentRequestBodySchema = z
  .object({
    content: commentContentSchema,
  })
  .strict();

export const updateCommentRequestValidationSchema: ZodValidationSchema = {
  body: updateCommentRequestBodySchema,
  params: updateCommentRequestParamsSchema,
};

export const updateCommentRequestSchema = {
  params: updateCommentRequestParamsSchema,
  body: {
    description: "Edit the content of a comment or reply (author only).",
    content: {
      "application/json": {
        schema: updateCommentRequestBodySchema,
      },
    },
  },
};
