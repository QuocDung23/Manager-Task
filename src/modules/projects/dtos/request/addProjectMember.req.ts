import { ZodValidationSchema } from "@/common";
import { z } from "zod";

export class AddProjectMemberRequestDto {
  userId: string;

  constructor(data: AddProjectMemberRequestDto) {
    this.userId = data.userId;
  }
}

export const addProjectMemberRequestParams = z
  .object({
    projectId: z.string().uuid(),
  })
  .strict();

export const addProjectMemberRequestBody = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const addProjectMemberRequestValidationSchema: ZodValidationSchema = {
  params: addProjectMemberRequestParams,
  body: addProjectMemberRequestBody,
};

export const addProjectMemberRequestSchema = {
  params: addProjectMemberRequestParams,
  body: {
    description: "Add member to project",
    content: {
      "application/json": {
        schema: addProjectMemberRequestBody,
      },
    },
  },
};
