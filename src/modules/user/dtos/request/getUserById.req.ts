import { ZodValidationSchema } from "@/common"
import { UserStatus } from "@prisma/client"
import z from "zod"

export class GetUserByUserIdRequestDto {
    userId: string
    status?: UserStatus

    constructor(userId: string, data: Partial<GetUserByUserIdRequestDto>) {
        this.userId = userId
        this.status = data?.status
    }
}

export const getUserByUserIdRequestParams = z.object({
    userId: z.uuid()
}).strict()

export const getUserByUserIdRequestQuery = z.object({
    status: z.enum(UserStatus).optional()
}).strict()

export const getUserByUserIdValidationSchema: ZodValidationSchema = {
    params: getUserByUserIdRequestParams,
    query: getUserByUserIdRequestQuery
}

export const getUserByUserIdRequestSchema = {
    params: getUserByUserIdRequestParams,
    query: getUserByUserIdRequestQuery
}