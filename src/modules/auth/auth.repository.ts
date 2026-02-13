import { accountsWithPartialRelations } from "@/models";
import { Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../data";

export class AuthRepository {
    constructor( private readonly prismaService = new PrismaService() ) {}
    async findAccount({
		accountId,
		userId,
		email,
		userStatus,
	}: {
		accountId?: string;
		userId?: string;
		email: string;
		userStatus?: UserStatus;
	}): Promise<accountsWithPartialRelations | null> {
		return this.prismaService.accounts.findFirst({
			include: {
				user: true,
			},
			where: {
				id: accountId,
				user: {
					id: userId,
					email: email,
					status: userStatus,
				},
			},
		});
	}

    async createAccount({accounts}: {accounts: Prisma.accountsCreateInput}): Promise<accountsWithPartialRelations> {
        return this.prismaService.accounts.create({
            include: {
                user: true
            },
            data: accounts
        })
    }
}