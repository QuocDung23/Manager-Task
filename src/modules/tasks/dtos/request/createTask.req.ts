import { ZodValidationSchema } from "@/common";
import z from "zod";

export class CreateTaskRequestDto {
  listId: string;
  name: string;
  description?: string;

  constructor(data: CreateTaskRequestDto) {
    this.listId = data.listId;
    this.name = data.name;
    this.description = data.description;
  }
}

export const createTaskRequestParamsSchema = z
  .object({
    listId: z.string().uuid(),
  })
  .strict();

export const createTaskRequestBodySchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
  })
  .strict();

export const createTaskRequestValidationSchema: ZodValidationSchema = {
  body: createTaskRequestBodySchema,
  params: createTaskRequestParamsSchema,
};

export const createTaskRequestSchema = {
  params: createTaskRequestParamsSchema,
  body: {
    description: "Create a new task",
    content: {
      "application/json": {
        schema: createTaskRequestBodySchema,
      },
    },
  },
};
