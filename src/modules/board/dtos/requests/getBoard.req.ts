import { ZodValidationSchema } from "@/common"
import { BoardStatus } from "@prisma/client"
import z from "zod"

export class GetBoardRequestDto {
    boardId: string
    userId: string
    name?: string
    status?: BoardStatus
    

    constructor(data: GetBoardRequestDto) {
        this.boardId = data.boardId
        this.name = data?.name
        this.status = data?.status  
        this.userId = data.userId
    }
}

export const getBoardByIdRequestParams = z.object({
    boardId: z.string().uuid(),
}).strict()

export const getBoardByIdRequestQuery = z.object({
    name: z.string().optional(),
    status: z.enum(BoardStatus).optional(),
}).strict()

export const getBoardByIdRequestValidationSchema: ZodValidationSchema = {
    params: getBoardByIdRequestParams,
    query: getBoardByIdRequestQuery,
}

export const getBoardRequestSchema = {
    params: getBoardByIdRequestParams,
    query: getBoardByIdRequestQuery,
}