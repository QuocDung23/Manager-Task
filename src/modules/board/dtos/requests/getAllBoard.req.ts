import { ZodValidationSchema } from "@/common";
import { BoardStatus } from "@prisma/client";
import z from "zod";

export class GetAllBoardRequestDto {
  projectId: string;
  name?: string;
  status?: BoardStatus;

  constructor(data: GetAllBoardRequestDto) {
    this.projectId = data.projectId;
    this.name = data?.name;
    this.status = data?.status;
  }
}

export const getAllBoardRequestQuery = z.object({
  name: z.string().optional(),
  status: z.enum(BoardStatus).optional(),
});
export const getAllBoardRequestParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export const getAllBoardRequestValidationSchema: ZodValidationSchema = {
  query: getAllBoardRequestQuery,
  params: getAllBoardRequestParamsSchema,
};

export const getAllBoardRequestSchema = {
  query: getAllBoardRequestQuery,
  params: getAllBoardRequestParamsSchema,
};
