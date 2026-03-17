import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware";
import z from "zod";

export class CreateListRequestDto {
  boardId: string;
  name: string;
  description?: string;

  constructor(data: CreateListRequestDto) {
    this.boardId = data.boardId;
    this.name = data.name;
    this.description = data.description;
  }
}

export const createListRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const createListRequestBodySchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
  })
  .strict();

export const createListRequestValidationSchema: ZodValidationSchema = {
  params: createListRequestParamsSchema,
  body: createListRequestBodySchema,
};

export const createListRequestSchema = {
  params: createListRequestParamsSchema,
  body: {
    description: "create a new list",
    content: {
      "application/json": {
        schema: createListRequestBodySchema,
      },
    },
  },
};

