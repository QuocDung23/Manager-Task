import { ZodValidationSchema } from "@/common"
import z from "zod"

export class CreateBoardRequestDto {
    name: string
    description: string
    projectId: string
    userId: string

    constructor(data: CreateBoardRequestDto) {
        this.name = data.name
        this.description = data.description
        this.projectId = data.projectId
        this.userId = data.userId
    }
}

export const createBoardRequestBodySchema = z.object({
    name: z.string().max(200),
    description: z.string().max(500),
})
export const createBoardRequestParamsSchema = z.object({
    projectId: z.string().uuid(),
}).strict()

export const createBoardRequestValidationSchema: ZodValidationSchema = {
    body: createBoardRequestBodySchema,
    params: createBoardRequestParamsSchema,
}

export const createBoardRequestSchema = {
    params: createBoardRequestParamsSchema,
    body: {
        description: "create a new board",
        content: {
            "application/json": {
                schema: createBoardRequestBodySchema
            }
        }
    },
}