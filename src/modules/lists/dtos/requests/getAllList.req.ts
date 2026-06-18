import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware";
import { ListStatus } from "@prisma/client";
import z from "zod";

export class GetAllListRequestDto {
  boardId: string;
  name?: string;
  limit: number;
  page: number;
  status?: ListStatus;

  constructor(data: GetAllListRequestDto) {
    this.boardId = data.boardId;
    this.name = data?.name;
    this.status = data?.status;
    this.limit = data?.limit;
    this.page = data?.page;
  }
}

export const getAllListRequestQuery = z
  .object({
    name: z.string().optional(),
    status: z.enum(ListStatus).optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const getAllListRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const getAllListRequestValidationSchema: ZodValidationSchema = {
  query: getAllListRequestQuery,
  params: getAllListRequestParamsSchema,
};

export const getAllListRequestSchema = {
  query: getAllListRequestQuery,
  params: getAllListRequestParamsSchema,
};
