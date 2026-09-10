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
    }) as unknown as accountsWithPartialRelations | null;
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
    }) as unknown as accountsWithPartialRelations;
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
        deleteAt: null,
      },
      create: {
        refreshToken: token.refreshToken,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findTokenByUserId(userId: string): Promise<tokens | null> {
    return this.prismaService.tokens.findFirst({
      where: {
        userId,
        deleteAt: null,
      },
    });
  }

  async findAccountByUserId(
    userId: string,
  ): Promise<accountsWithPartialRelations | null> {
    return this.prismaService.accounts.findFirst({
      where: {
        userId: userId,
      },
    }) as unknown as accountsWithPartialRelations | null;
  }

  async updateAccountPassword(args: {
    userId: string;
    passwordHash: string;
    salt: string;
  }): Promise<void> {
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

  async deleteTokenByUserId(userId: string): Promise<void> {
    await this.prismaService.tokens.updateMany({
      where: {
        userId,
        deleteAt: null,
      },
      data: {
        deleteAt: new Date(),
      },
    });
  }

  async deleteExpiredPendingAccounts(cutoff: Date): Promise<number> {
    const pendingUsers = await this.prismaService.users.findMany({
      where: {
        verify: false,
        status: UserStatus.PENDING,
        createdAt: {
          lte: cutoff,
        },
      },
      select: {
        id: true,
      },
    });

    if (pendingUsers.length === 0) {
      return 0;
    }

    const userIds = pendingUsers.map((user) => user.id);

    await this.prismaService.$transaction([
      this.prismaService.userRoles.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),
      this.prismaService.tokens.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),
      this.prismaService.otps.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),
      this.prismaService.accounts.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      }),
      this.prismaService.users.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      }),
    ]);

    return userIds.length;
  }
}
