import { accountsWithPartialRelations } from "@/models"
import { UserStatus } from "@prisma/client"
import { verify } from "node:crypto"
import z, { email } from "zod"

export class AccountResDto {
    id: string
    userId: string
    email: string
    name: string
    bio: string
    avatar: string
    verify: boolean
    status: UserStatus

    constructor(account: accountsWithPartialRelations) {
        this.id = account.id
        this.userId = account.userId 
        this.email = account.user?.email || ''
        this.name = account.user?.name || ''
        this.bio = account.user?.bio || ''
        this.avatar =  account.user?.avatar || ''
        this.verify = account.user?.verify || false
        this.status = account.user?.status || UserStatus.ACTIVE
    }
}

export const accountResDtoSchema = z.object ({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    avatar: z.url(),
    bio: z.string(),
    verify: z.boolean(),
    status: z.enum(UserStatus)
})