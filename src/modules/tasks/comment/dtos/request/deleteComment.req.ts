import { ZodValidationSchema } from "@/common";
import z from "zod";

export class DeleteCommentRequestDto {
  taskId: string;
  commentId: string;
  userId: string;

  constructor(data: DeleteCommentRequestDto) {
    this.taskId = data.taskId;
    this.commentId = data.commentId;
    this.userId = data.userId;
  }
}

export const deleteCommentRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
    commentId: z.string().uuid(),
  })
  .strict();

export const deleteCommentRequestValidationSchema: ZodValidationSchema = {
  params: deleteCommentRequestParamsSchema,
};

export const deleteCommentRequestSchema = {
  params: deleteCommentRequestParamsSchema,
};
