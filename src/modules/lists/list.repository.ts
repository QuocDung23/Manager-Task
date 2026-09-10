import { lists, ListStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../data/prisma.client";

export class ListRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  //get all tất cả các list 
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

  async updateList({
    id,
    list,
  }: {
    id: string;
    list: Prisma.listsUpdateInput;
  }): Promise<lists> {
    const { ...data } = list;
    return this.prisma.lists.update({
      where: { id },
      data: data,
    });
  }

  async deleteList(id: string): Promise<lists> {
    return this.prisma.lists.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
        status: ListStatus.INACTIVE,
      },
    });
  }

  //lấy tát cả list bằng listIds
  async getListsByIds(args: {
    boardId: string;
    listIds: string[];
  }): Promise<lists[]> {
    const { boardId, listIds } = args;

    return this.prisma.lists.findMany({
      where: {
        boardId,
        id: { in: listIds },
        deletedAt: null,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  async countListsByBoardId(boardId: string): Promise<number> {
    return this.prisma.lists.count({
      where: {
        boardId,
        deletedAt: null,
      },
    });
  }

  async updateOrders(
    updates: Array<{ id: string; order: number }>,
  ): Promise<lists[]> {
    if (updates.length === 0) return [];

    return this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.lists.update({
          where: { id: u.id },
          data: { order: u.order },
        }),
      ),
    );
  }
}
