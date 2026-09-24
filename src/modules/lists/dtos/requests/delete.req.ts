import { ZodValidationSchema } from "@/common";
import z from "zod";

export class DeleteListRequestDto {
    id: string

    constructor(data: DeleteListRequestDto) {
        this.id = data.id;
    }
}

export const deleteListRequestParamsSchema = z.object({
    id: z.string().uuid(),
}).strict();

export const deleteListRequestValidationSchema: ZodValidationSchema = {
    params: deleteListRequestParamsSchema,
};

export const deleteListRequestSchema = {
    params: deleteListRequestParamsSchema
}