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
  projectId: z.string().uuid(),
  name: z.string().optional(),
  status: z.enum(BoardStatus).optional(),
});

export const getAllBoardRequestValidationSchema: ZodValidationSchema = {
  query: getAllBoardRequestQuery,
};

export const getAllBoardRequestSchema = {
  query: getAllBoardRequestQuery,
};
