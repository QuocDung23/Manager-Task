import { ZodValidationSchema } from "@/common";
import z from "zod";

export class UpdateListRequestDto {
  id: string;
  name?: string;
  description?: string;
  order?: number;

  constructor(data: UpdateListRequestDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.order = data.order;
  }
}

export const updateListRequestParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export const updateListRequestBodySchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    order: z.number().int().optional(),
  })
  .strict();

export const updateListRequestValidationSchema: ZodValidationSchema = {
  params: updateListRequestParamsSchema,
  body: updateListRequestBodySchema,
};

export const updateListRequestSchema = {
  params: updateListRequestParamsSchema,
  body: {
    description: "update a list",
    content: {
      "application/json": {
        schema: updateListRequestBodySchema,
      },
    },
  },
};
