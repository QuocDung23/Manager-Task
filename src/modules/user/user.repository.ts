import { Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../data";
import { users } from "@/models";

export class UserRepository {
  constructor(private readonly prismaService = new PrismaService()) {}

  async findUsers({
    name,
    status,
    skip,
    take,
  }: {
    name: string;
    status?: UserStatus;
    skip: number;
    take: number;
  }): Promise<[users[], number]> {
    return Promise.all([
      this.prismaService.users.findMany({
        where: {
          name: name,
          status: status,
        },
        skip: skip,
        take: take,
      }),
      this.prismaService.users.count({
        where: {
          name: name,
          status: status,
        },
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
