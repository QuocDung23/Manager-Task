import { ZodValidationSchema } from "@/common"
import { TaskStatus } from "@prisma/client"
import z from "zod"

export class updateTaskRequestDto {
    id: string
    name?: string
    description?: string


    constructor(data: updateTaskRequestDto) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
    }
}

export const updateTaskRequestParamsSchema = z.object({
    id: z.string().uuid(),
}).strict()

export const updateTaskRequestBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
}).strict()

export const updateTaskRequestValidationSchema: ZodValidationSchema = {
    params: updateTaskRequestParamsSchema,
    body: updateTaskRequestBodySchema,
}

export const updateTaskRequestSchema = {
    params: updateTaskRequestParamsSchema,
    body: {
        description: "Update a task",
        content: {
            "application/json": {
                schema: updateTaskRequestBodySchema,
            }
        }
    }
}