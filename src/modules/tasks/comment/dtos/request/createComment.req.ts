import { ZodValidationSchema } from "@/common";
import z from "zod";

const commentContentSchema = z.string().trim().min(1).max(2000);

export class CreateCommentRequestDto {
  taskId: string;
  userId: string;
  content: string;

  constructor(data: CreateCommentRequestDto) {
    this.taskId = data.taskId;
    this.userId = data.userId;
    this.content = data.content;
  }
}

export const createCommentRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const createCommentRequestBodySchema = z
  .object({
    content: commentContentSchema,
  })
  .strict();

export const createCommentRequestValidationSchema: ZodValidationSchema = {
  body: createCommentRequestBodySchema,
  params: createCommentRequestParamsSchema,
};

export const createCommentRequestSchema = {
  params: createCommentRequestParamsSchema,
  body: {
    description: "Create a new root comment for a task.",
    content: {
      "application/json": {
        schema: createCommentRequestBodySchema,
      },
    },
  },
};
