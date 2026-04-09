import { TaskStatus } from "@prisma/client"
import z from "zod"

export class TaskResponseDto {
    id: string
    name: string
    description?: string
    orderTask: number
    dueDate?: Date
    listId: string
    assign: string[]
    status: TaskStatus

    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null

    constructor(data: TaskResponseDto) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.orderTask = data.orderTask
        this.dueDate = data.dueDate
        this.listId = data.listId
        this.assign = data.assign || []
        this.status = data.status

        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.deletedAt = data.deletedAt
    }
}

export const taskResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    listId: z.string().uuid(),
    assign: z.array(z.string().uuid()),
    status: z.enum(TaskStatus),

    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
})