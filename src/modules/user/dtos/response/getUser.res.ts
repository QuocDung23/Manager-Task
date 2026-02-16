import { users } from "@/models"
import { UserStatus } from "@prisma/client"
import z from "zod"

export class GetUserResponseDto {
    id: string
    name: string
    email: string
    bio: string | null | undefined
    avatar: string | null | undefined
    address: string | null | undefined
    phone: string | null | undefined

    updatedAt: Date | null | undefined
    createddAt: Date | null | undefined
    deletedAt: Date | null | undefined
    status: UserStatus

    constructor(userInfo: users) {
        this.id = userInfo.id
        this.name = userInfo.name
        this.email = userInfo.email
        this.bio = userInfo.bio 
        this.avatar = userInfo.avatar
        this.address = userInfo.address
        this.phone = userInfo.phone

        this.updatedAt = userInfo.updatedAt
        this.createddAt = userInfo.createdAt
        this.deletedAt = userInfo.deletedAt
        this.status = userInfo.status
    }
}

export const getUserResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),

    updatedAt: z.date(),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    status: z.enum(UserStatus)
})