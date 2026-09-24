import { ZodValidationSchema } from "@/common";
import { ProjectStatus } from "@prisma/client";
import z from "zod";

export class GetAllProjectRequestDto {
  name?: string;
  status?: ProjectStatus;
  userId?: string;

  constructor(data?: GetAllProjectRequestDto) {
    this.name = data?.name;
    this.status = data?.status;
    this.userId = data?.userId;
  }
}

export const getAllProjectRequestQuery = z.object({
  name: z.string().optional(),
  status: z.enum(ProjectStatus).optional(),
});

export const getAllProjectRequestValidationSchema: ZodValidationSchema = {
  query: getAllProjectRequestQuery,
};

export const getAllProjectRequestSchema = {
  query: getAllProjectRequestQuery,
};
