import { ZodValidationSchema } from "@/common";
import z from "zod";

export class CreateProjectRequestDto {
  name: string;
  description: string;
  userId: string;

  constructor(data: CreateProjectRequestDto) {
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
  }
}

export const createProjectRequestBodySchema = z.object({
  name: z.string().max(200),
  description: z.string().max(500),
});

export const createProjectRequestValidationSchema: ZodValidationSchema = {
  body: createProjectRequestBodySchema,
};

export const createProjectRequestSchema = {
  body: {
    description: "create a new project",
    content: {
      "application/json": {
        schema: createProjectRequestBodySchema,
      },
    },
  },
};
