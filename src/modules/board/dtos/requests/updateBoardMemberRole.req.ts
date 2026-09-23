import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware";
import z from "zod";

export class UpdateBoardMemberRoleRequestDto {
  boardId: string;
  userId: string;
  roleId: string;

  constructor(data: UpdateBoardMemberRoleRequestDto) {
    this.boardId = data.boardId;
    this.userId = data.userId;
    this.roleId = data.roleId;
  }
}

export const updateBoardMemberRoleParamsSchema = z
  .object({
    boardId: z.string().uuid(),
    userId: z.string().uuid(),
  })
  .strict();

export const updateBoardMemberRoleBodySchema = z
  .object({
    roleId: z.string().uuid(),
  })
  .strict();

export const updateBoardMemberRoleValidationSchema: ZodValidationSchema = {
  params: updateBoardMemberRoleParamsSchema,
  body: updateBoardMemberRoleBodySchema,
};

export const updateBoardMemberRoleRequestSchema = {
  params: updateBoardMemberRoleParamsSchema,
  body: {
    description: "Update a board member role",
    content: {
      "application/json": {
        schema: updateBoardMemberRoleBodySchema,
      },
    },
  },
};
