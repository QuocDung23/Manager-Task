import { ZodValidationSchema } from "@/common";
import z from "zod";

export class ReorderListRequestDto {
  boardId: string;
  listIds: string[];

  constructor(data: ReorderListRequestDto) {
    this.boardId = data.boardId;
    this.listIds = data.listIds;
  }
}

export const reorderListRequestParams = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const reorderListRequestBody = z
  .object({
    listIds: z.array(z.string().uuid()).min(1),
  })
  .strict();

export const reorderListRequestValidationSchema: ZodValidationSchema = {
  params: reorderListRequestParams,
  body: reorderListRequestBody,
};

export const reorderListRequestSchema = {
  params: reorderListRequestParams,
  body: {
    description: "reorder lists by new listIds order",
    content: {
      "application/json": {
        schema: reorderListRequestBody,
      },
    },
  },
};
