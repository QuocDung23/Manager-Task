import { ZodValidationSchema } from "@/common";
import z from "zod";

export class ProjectRequestDto {
  name: string;
  description: string;
  userId: string

  constructor(data: ProjectRequestDto) {
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
  }
}

export const projectRequestBodySchema = z.object({
  name: z.string().max(200),
  description: z.string().max(500),
});

export const projectRequestValidationSchema: ZodValidationSchema = {
  body: projectRequestBodySchema,
};

export const projectRequestSchema = {
  body: {
    description: "create a new project",
    content: {
      "application/json": {
        schema: projectRequestBodySchema,
      },
    },
  },
};
