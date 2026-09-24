import { ZodValidationSchema } from "@/common";
import z from "zod";

export class UpdateProjectRequestDto {
  name?: string;
  description?: string;

  constructor(data: Partial<UpdateProjectRequestDto> = {}) {
    this.name = data?.name;
    this.description = data?.description;
  }
}

export const updateProjectRequestBody = z
  .object({
    name: z.string(),
    description: z.string(),
  })
  .strict();

export const updateProjectRequestParams = z
  .object({
    projectId: z.uuid(),
  })
  .strict();

export const updateProjectRequestValidationSchema: ZodValidationSchema = {
  params: updateProjectRequestParams,
  body: updateProjectRequestBody,
};

export const updateProjectRequestSchema = {
  params: updateProjectRequestParams,
  body: {
    description: "Update project",
    content: {
      "application/json": {
        schema: updateProjectRequestBody,
      },
    },
  },
};
