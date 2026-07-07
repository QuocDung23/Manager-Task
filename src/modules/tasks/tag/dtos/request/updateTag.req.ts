import { ZodValidationSchema } from "@/common";
import z from "zod";
import { tagColorSchema } from "./tagCommon.req";

export class UpdateTagRequestDto {
  boardId: string;
  tagId: string;
  name?: string;
  color?: string;

  constructor(data: UpdateTagRequestDto) {
    this.boardId = data.boardId;
    this.tagId = data.tagId;
    this.name = data.name;
    this.color = data.color;
  }
}

export const updateTagRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
    tagId: z.string().uuid(),
  })
  .strict();

export const updateTagRequestBodySchema = z
  .object({
    name: z.string().trim().min(1).max(50).optional(),
    color: tagColorSchema.optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.color !== undefined, {
    message: "At least one field is required",
  });

export const updateTagRequestValidationSchema: ZodValidationSchema = {
  params: updateTagRequestParamsSchema,
  body: updateTagRequestBodySchema,
};

export const updateTagRequestSchema = {
  params: updateTagRequestParamsSchema,
  body: {
    description: "Update a board-scoped task tag",
    content: {
      "application/json": {
        schema: updateTagRequestBodySchema,
      },
    },
  },
};
