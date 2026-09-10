import { ZodValidationSchema } from "@/common"
import { TaskStatus } from "@prisma/client"
import z from "zod"

export class GetTaskByIdRequestDto {
    id: string
    name: string
    status: TaskStatus

    constructor(data: GetTaskByIdRequestDto) {
        this.id = data.id
        this.name = data.name
        this.status = data.status
    }
}

export const getTaskByIdRequestParamsSchema = z.object({
    id: z.string().uuid(),
}).strict()

export const getTaskByIdRequestValidationSchema: ZodValidationSchema = {
    params: getTaskByIdRequestParamsSchema,
}

export const getTaskByIdRequestSchema = {
    params: getTaskByIdRequestParamsSchema,
}