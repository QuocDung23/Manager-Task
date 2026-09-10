import { ListStatus } from "@prisma/client"
import z from "zod"

export class ListResponseDto {
    id: string
    name: string
    description: string
    order: number
    boardId: string
    status: ListStatus

    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null

    constructor(data: ListResponseDto) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.order = data.order
        this.boardId = data.boardId
        this.status = data.status
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.deletedAt = data.deletedAt
    }
}

export const listResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    order: z.number(),
    boardId: z.string().uuid(),
    status: z.enum(ListStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
})