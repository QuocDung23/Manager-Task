import { lists, ListStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../data/prisma.client";

export class ListRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  getLists(args: {
    boardId: string;
    name?: string;
    status?: ListStatus;
    skip: number;
    take: number;
  }): Promise<[lists[], number]> {
    const { boardId, name, status, skip, take } = args;

    const where: Prisma.listsWhereInput = {
      boardId,
      deletedAt: null,
    };

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status as any;
    }

    return this.prisma.$transaction([
      this.prisma.lists.findMany({
        where,
        skip,
        take,
        orderBy: {
          order: "asc",
        },
      }),
      this.prisma.lists.count({ where }),
    ]);
  }

  getListById(id: string): Promise<lists | null> {
    return this.prisma.lists.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async getMaxOrder(boardId: string): Promise<number> {
    const agg = await this.prisma.lists.aggregate({
      where: {
        boardId,
        deletedAt: null,
      },
      _max: { order: true },
    });
    return agg._max.order ?? 0;
  }

  createList(data: Prisma.listsCreateInput): Promise<lists> {
    return this.prisma.lists.create({ data });
  }

  async updateList({id, list}: {id: string, list: Prisma.listsUpdateInput}): Promise<lists> {
    const { ...data } = list;
    return this.prisma.lists.update({
      where: { id },
      data: data,
    });
  }

  async deleteList(id: string): Promise<lists> {
    return this.prisma.lists.update({
      where: { id: id, },
      data: {
        deletedAt: new Date(),
        status: ListStatus.INACTIVE,
      },
    });
  }
}
