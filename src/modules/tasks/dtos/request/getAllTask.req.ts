import { TaskStatus } from "@prisma/client"
import { ZodValidationSchema } from "@/common"
import { z } from "zod"

export class GetAllTaskRequestDto {
    listId: string
    status: TaskStatus
    name: string

    constructor(data: GetAllTaskRequestDto) {
        this.listId = data.listId
        this.status = data.status
        this.name = data.name
    }
}

export const getAllTaskRequestQuery = z.object({
    name: z.string().optional(),
    status: z.enum(TaskStatus).optional(),
}).strict()

export const getAllTaskRequestParamsSchema = z.object({
    listId: z.string().uuid(),
}).strict()

export const getAllTaskRequestValidationSchema: ZodValidationSchema = {
    query: getAllTaskRequestQuery,
    params: getAllTaskRequestParamsSchema,
}

export const getAllTaskRequestSchema = {
    query: getAllTaskRequestQuery,
    params: getAllTaskRequestParamsSchema,
}