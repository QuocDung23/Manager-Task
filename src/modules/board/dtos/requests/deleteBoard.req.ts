import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware"
import z from "zod"

export class DeleteBoardRequestDto {
    boardId: string
    userId: string

    constructor(data: DeleteBoardRequestDto) {
        this.boardId = data.boardId
        this.userId = data.userId
    }
}

export const deleteBoardRequestParamsSchema = z.object({
    boardId: z.string().uuid(),
}).strict()

export const deleteBoardRequestValidationSchema: ZodValidationSchema = {
    params: deleteBoardRequestParamsSchema,
}

export const deleteBoardRequestSchema = {
    params: deleteBoardRequestParamsSchema,
}
