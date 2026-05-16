import { Prisma, UserStatus, users } from "@prisma/client";
import { PrismaService } from "../data";

export class UserRepository {
  constructor(private readonly prismaService = new PrismaService()) {}

  async findUsers({
    name,
    email,
    status,
    skip,
    take,
  }: {
    name?: string;
    email?: string;
    status?: UserStatus;
    skip: number;
    take: number;
  }): Promise<[users[], number]> {
    const orConditions: Prisma.usersWhereInput[] = [];
    if (name) {
      orConditions.push({
        name: { contains: name, mode: "insensitive" as const },
      });
    }
    if (email) {
      orConditions.push({
        email: { contains: email, mode: "insensitive" as const },
      });
    }

    const where: Prisma.usersWhereInput = {
      ...(status !== undefined ? { status } : {}),
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    };

    return Promise.all([
      this.prismaService.users.findMany({
        where,
        skip,
        take,
      }),
      this.prismaService.users.count({
        where,
      }),
    ]);
  }

  async findUser({
    userId,
    email,
    status,
  }: {
    userId?: string;
    email?: string;
    status?: UserStatus;
  }): Promise<users | null> {
    return this.prismaService.users.findFirst({
      where: {
        id: userId,
        email: email,
        status: status,
      },
    });
  }

  async updateUser({
    userId,
    user,
  }: {
    userId: string;
    user: Prisma.usersUpdateManyMutationInput;
  }): Promise<users> {
    const { id, ...data } = user;
    return this.prismaService.users.update({
      where: { id: userId },
      data: data,
    });
  }
}
