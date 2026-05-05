import { accountsWithPartialRelations } from "@/models";
import { tokens, UserStatus } from "@prisma/client";
import { Prisma, PrismaService } from "../data";

export class AuthRepository {
  constructor(private readonly prismaService = new PrismaService()) {}
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

  async createAccount({
    accounts,
  }: {
    accounts: Prisma.accountsCreateInput;
  }): Promise<accountsWithPartialRelations> {
    return this.prismaService.accounts.create({
      include: {
        user: true,
      },
      data: accounts,
    });
  }

  async addUserRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prismaService.roles.findUnique({
      where: { name: roleName },
    });
    if (!role) return;
    await this.prismaService.userRoles.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  async createToken({
    token,
  }: {
    token: Prisma.tokensCreateInput;
  }): Promise<tokens> {
    const userId = token.user?.connect?.id;

    if (!userId) {
      throw new Error("User ID is required to create token");
    }

    return this.prismaService.tokens.upsert({
      where: {
        userId: userId,
      },
      update: {
        refreshToken: token.refreshToken,
      },
      create: {
        refreshToken: token.refreshToken,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findAccountByUserId(userId: string): Promise<accountsWithPartialRelations | null>{
    return this.prismaService.accounts.findFirst({
      where: {
        userId: userId,
      },
    });
  }

  async updateAccountPassword(args: { userId: string; passwordHash: string; salt: string }): Promise<void> {
    await this.prismaService.accounts.updateMany({
      where: {
        userId: args.userId,
      },
      data: {
        password: args.passwordHash,
        salt: args.salt,
      },
    });
  }
}
