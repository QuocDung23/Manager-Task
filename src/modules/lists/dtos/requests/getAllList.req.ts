import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware";
import { ListStatus } from "@prisma/client";
import z from "zod";

export class GetAllListRequestDto {
  boardId: string;
  name?: string;
  status?: ListStatus;

  constructor(data: GetAllListRequestDto) {
    this.boardId = data.boardId;
    this.name = data?.name;
    this.status = data?.status;
  }
}

export const getAllListRequestQuery = z
  .object({
    name: z.string().optional(),
    status: z.enum(ListStatus).optional(),
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
