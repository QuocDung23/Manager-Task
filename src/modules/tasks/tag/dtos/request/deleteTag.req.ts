import { ZodValidationSchema } from "@/common";
import z from "zod";

export class DeleteTagRequestDto {
  boardId: string;
  tagId: string;

  constructor(data: DeleteTagRequestDto) {
    this.boardId = data.boardId;
    this.tagId = data.tagId;
  }
}

export const deleteTagRequestParamsSchema = z
  .object({
    boardId: z.string().uuid(),
    tagId: z.string().uuid(),
  })
  .strict();

export const deleteTagRequestValidationSchema: ZodValidationSchema = {
  params: deleteTagRequestParamsSchema,
};

export const deleteTagRequestSchema = {
  params: deleteTagRequestParamsSchema,
};
