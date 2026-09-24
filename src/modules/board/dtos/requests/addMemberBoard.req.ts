import { ZodValidationSchema } from "@/common/middlewares/validationRequest.middleware"
import z from "zod"

export class AddMemberBoardRequestDto {
    boardId: string
    userId: string

    constructor(data: AddMemberBoardRequestDto) {
        this.boardId = data.boardId
        this.userId = data.userId
    }
}

export const addMemberBoardRequestParamsSchema = z.object({
    boardId: z.string().uuid(),
}).strict()

export const addMemberBoardRequestBodySchema = z.object({
    userId: z.string().uuid(),
}).strict()

export const addMemberBoardRequestValidationSchema: ZodValidationSchema = {
    params: addMemberBoardRequestParamsSchema,
    body: addMemberBoardRequestBodySchema,
}

export const addMemberBoardRequestSchema = {
    params: addMemberBoardRequestParamsSchema,
    body: {
        description: 'Add member to board',
        content: {
            'application/json': {
                schema: addMemberBoardRequestBodySchema,
            },
        },
    },
}