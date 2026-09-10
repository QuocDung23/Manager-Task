import { ZodValidationSchema } from "@/common";
import z from "zod";

export class ReplaceTaskTagsRequestDto {
  taskId: string;
  tagIds: string[];

  constructor(data: ReplaceTaskTagsRequestDto) {
    this.taskId = data.taskId;
    this.tagIds = data.tagIds;
  }
}

export const replaceTaskTagsRequestParamsSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export const replaceTaskTagsRequestBodySchema = z
  .object({
    tagIds: z.array(z.string().uuid()),
  })
  .strict()
  .refine((data) => new Set(data.tagIds).size === data.tagIds.length, {
    message: "tagIds contains duplicates",
    path: ["tagIds"],
  });

export const replaceTaskTagsRequestValidationSchema: ZodValidationSchema = {
  params: replaceTaskTagsRequestParamsSchema,
  body: replaceTaskTagsRequestBodySchema,
};

export const replaceTaskTagsRequestSchema = {
  params: replaceTaskTagsRequestParamsSchema,
  body: {
    description:
      "Replace all tags of a task. Send an empty tagIds array to clear all tags.",
    content: {
      "application/json": {
        schema: replaceTaskTagsRequestBodySchema,
      },
    },
  },
};
