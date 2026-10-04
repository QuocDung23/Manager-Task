import { ZodValidationSchema } from "@/common";
import { z } from "zod";

export const leaveBoardParams = z.object({
  boardId: z.string().uuid(),
}).strict();

export const leaveBoardValidationSchema: ZodValidationSchema = {
  params: leaveBoardParams,
};

export const leaveBoardRequestSchema = {
  params: leaveBoardParams,
};
