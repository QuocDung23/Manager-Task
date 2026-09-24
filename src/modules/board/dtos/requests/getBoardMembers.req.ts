import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware";
import z from "zod";

export class GetBoardMembersRequestDto {
  boardId: string;

  constructor(data: GetBoardMembersRequestDto) {
    this.boardId = data.boardId;
  }
}

export const getBoardMembersRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const getBoardMembersRequestValidationSchema: ZodValidationSchema = {
  params: getBoardMembersRequestParamsSchema,
};

export const getBoardMembersRequestSchema = {
  params: getBoardMembersRequestParamsSchema,
};
