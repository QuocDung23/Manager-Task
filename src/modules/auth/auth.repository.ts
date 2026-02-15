import { accountsWithPartialRelations } from "@/models";
import { tokens, UserStatus } from "@prisma/client";
import { Prisma, PrismaService } from "../data";

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

	async createToken({ token }: { token: Prisma.tokensCreateInput }): Promise<tokens> {
        const userId = token.user?.connect?.id;

        if (!userId) {
            throw new Error("User ID is required to create token");
        }

        return this.prismaService.tokens.upsert({
            where: { 
                userId: userId 
            },
            update: { 
                refreshToken: token.refreshToken 
            },
            create: {
                refreshToken: token.refreshToken,
                user: {
                    connect: { id: userId }
                }
            }
        });
    }
}