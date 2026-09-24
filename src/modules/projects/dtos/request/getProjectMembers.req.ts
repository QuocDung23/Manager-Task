import { ZodValidationSchema } from "@/common";
import { z } from "zod";

export const getProjectMembersRequestParams = z
  .object({
    projectId: z.string().uuid(),
  })
  .strict();

export const getProjectMembersRequestValidationSchema: ZodValidationSchema = {
  params: getProjectMembersRequestParams,
};

export const getProjectMembersRequestSchema = {
  params: getProjectMembersRequestParams,
};
