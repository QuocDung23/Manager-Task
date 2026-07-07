import { TaskStatus } from "@prisma/client";
import { ZodValidationSchema } from "@/common";
import { z } from "zod";

const taskStatusValues = Object.values(TaskStatus) as [
  TaskStatus,
  ...TaskStatus[],
];
const taskTagModeValues = ["ANY", "ALL"] as const;

const commaSeparatedUuidArraySchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string().uuid()));

export class GetAllTaskRequestDto {
  listId: string;
  status?: TaskStatus;
  name?: string;
  tagIds?: string[];
  tagMode?: "ANY" | "ALL";

  constructor(data: GetAllTaskRequestDto) {
    this.listId = data.listId;
    this.status = data.status;
    this.name = data.name;
    this.tagIds = data.tagIds;
    this.tagMode = data.tagMode;
  }
}

export const getAllTaskRequestQuery = z
  .object({
    name: z.string().optional(),
    status: z.enum(taskStatusValues).optional(),
    tagIds: commaSeparatedUuidArraySchema.optional(),
    tagMode: z.enum(taskTagModeValues).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.tagMode) return true;
      return Array.isArray(data.tagIds) && data.tagIds.length > 0;
    },
    {
      message: "tagMode requires tagIds",
      path: ["tagMode"],
    },
  )
  .refine(
    (data) => {
      if (!Array.isArray(data.tagIds)) return true;
      return new Set(data.tagIds).size === data.tagIds.length;
    },
    {
      message: "tagIds contains duplicates",
      path: ["tagIds"],
    },
  );

export const getAllTaskRequestParamsSchema = z
  .object({
    listId: z.string().uuid(),
  })
  .strict();

export const getAllTaskRequestValidationSchema: ZodValidationSchema = {
  query: getAllTaskRequestQuery,
  params: getAllTaskRequestParamsSchema,
};

export const getAllTaskRequestSchema = {
  query: getAllTaskRequestQuery,
  params: getAllTaskRequestParamsSchema,
};
