import { ZodValidationSchema } from "@/common";
import z from "zod";
import { tagColorSchema } from "./tagCommon.req";

export class CreateTagRequestDto {
  boardId: string;
  name: string;
  color?: string;

  constructor(data: CreateTagRequestDto) {
    this.boardId = data.boardId;
    this.name = data.name;
    this.color = data.color;
  }
}

export const createTagRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const createTagRequestBodySchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    color: tagColorSchema.optional(),
  })
  .strict();

export const createTagRequestValidationSchema: ZodValidationSchema = {
  params: createTagRequestParamsSchema,
  body: createTagRequestBodySchema,
};

export const createTagRequestSchema = {
  params: createTagRequestParamsSchema,
  body: {
    description: "Create a board-scoped task tag",
    content: {
      "application/json": {
        schema: createTagRequestBodySchema,
      },
    },
  },
};
