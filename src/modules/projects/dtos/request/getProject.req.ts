import { ZodValidationSchema } from "@/common";
import { ProjectStatus } from "@prisma/client";
import z from "zod";

export class GetProjectRequestDto {
  projectId: string;
  name?: string;
  status?: ProjectStatus;

  constructor(data: GetProjectRequestDto) {
    this.projectId = data.projectId;
    this.name = data?.name;
    this.status = data?.status as ProjectStatus;
  }
}

export const getProjectRequestParams = z.object({
  projectId: z.string().uuid(),
}).strict();
export const getProjectRequestQuery = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
}).strict()

export const getProjectRequestVadilationSchema: ZodValidationSchema = {
  params: getProjectRequestParams,
  query: getProjectRequestQuery
};

export const getProjectSchema = {
  params: getProjectRequestParams,
  query: getProjectRequestQuery
};
