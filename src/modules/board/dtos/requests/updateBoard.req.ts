import { ZodValidationSchema } from "@/common";
import z from "zod";

export class UpdateBoardRequestDto {
  name?: string;
  description?: string;
  boardId: string;
  userId: string;

  constructor(data: UpdateBoardRequestDto) {
    this.name = data.name;
    this.description = data.description;
    this.boardId = data.boardId;
    this.userId = data.userId;
  }
}

export const updateBoardRequestBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(500).optional().default(""),
  })
  .strict();

export const updateBoardRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const updateBoardRequestValidationSchema: ZodValidationSchema = {
  body: updateBoardRequestBodySchema,
  params: updateBoardRequestParamsSchema,
};

export const updateBoardRequestSchema = {
  params: updateBoardRequestParamsSchema,
  body: {
    description: "Update board",
    content: {
      "application/json": {
        schema: updateBoardRequestBodySchema,
      },
    },
  },
};
