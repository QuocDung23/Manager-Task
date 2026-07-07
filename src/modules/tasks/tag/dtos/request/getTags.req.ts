import { ZodValidationSchema } from "@/common";
import z from "zod";

export class GetTagsRequestDto {
  boardId: string;
  name?: string;
  includeDeleted?: boolean;

  constructor(data: GetTagsRequestDto) {
    this.boardId = data.boardId;
    this.name = data.name;
    this.includeDeleted = data.includeDeleted;
  }
}

export const getTagsRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
  })
  .strict();

export const getTagsRequestQuerySchema = z
  .object({
    name: z.string().trim().optional(),
    includeDeleted: z.coerce.boolean().optional(),
  })
  .strict();

export const getTagsRequestValidationSchema: ZodValidationSchema = {
  params: getTagsRequestParamsSchema,
  query: getTagsRequestQuerySchema,
};

export const getTagsRequestSchema = {
  params: getTagsRequestParamsSchema,
  query: getTagsRequestQuerySchema,
};
