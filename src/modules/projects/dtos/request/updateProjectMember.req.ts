import { ZodValidationSchema } from "@/common";
import { z } from "zod";

export class UpdateProjectMemberRequestDto {
  roleId: string;

  constructor(data: UpdateProjectMemberRequestDto) {
    this.roleId = data.roleId;
  }
}

export const projectMemberResourceParams = z
  .object({
    projectId: z.string().uuid(),
    memberId: z.string().uuid(),
  })
  .strict();

export const updateProjectMemberRequestBody = z
  .object({
    roleId: z.string().uuid(),
  })
  .strict();

export const updateProjectMemberRequestValidationSchema: ZodValidationSchema = {
  params: projectMemberResourceParams,
  body: updateProjectMemberRequestBody,
};

export const updateProjectMemberRequestSchema = {
  params: projectMemberResourceParams,
  body: {
    description: "Update a project member role",
    content: {
      "application/json": {
        schema: updateProjectMemberRequestBody,
      },
    },
  },
};

export const deleteProjectMemberRequestValidationSchema: ZodValidationSchema = {
  params: projectMemberResourceParams,
};

export const deleteProjectMemberRequestSchema = {
  params: projectMemberResourceParams,
};
