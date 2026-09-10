import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware";
import z from "zod";

export class GetListByIdRequestDto {
  id: string;

  constructor(data: GetListByIdRequestDto) {
    this.id = data.id;
  }
}

export const getListByIdRequestParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export const getListByIdRequestValidationSchema: ZodValidationSchema = {
  params: getListByIdRequestParamsSchema,
};

export const getListByIdRequestSchema = {
  params: getListByIdRequestParamsSchema,
};

