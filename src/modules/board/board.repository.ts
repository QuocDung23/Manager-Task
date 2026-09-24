import { boards } from "@/models";
import { PrismaService } from "../data";
import { BoardStatus, Prisma } from "@prisma/client";

type BoardWithOwner = Prisma.boardsGetPayload<{ include: { user: true } }>;

export class BoardRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async getBoardById({
    id,
    name,
    status,
    projectId,
    userId,
  }: {
    id?: string;
    name?: string;
    status?: BoardStatus;
    projectId?: string;
    userId?: string;
  }): Promise<boards | null> {
    return this.prisma.boards.findFirst({
      where: {
        id: id,
        name: name,
        status: status,
        projectId: projectId,
        userId: userId,

        deletedAt: { equals: null },
      },
    });
  }

  async getBoards({
    projectId,
    name,
    status,
    userId,
    skip,
    take,
  }: {
    projectId?: string;
    name?: string;
    status?: BoardStatus;
    userId?: string;
    skip: number;
    take: number;
  }): Promise<[boards[], number]> {
    const baseWhere: Prisma.boardsWhereInput = {
      projectId: projectId,
      userId: userId,
      status: status,
      deletedAt: { equals: null },
    };

    if (name) {
      baseWhere.OR = [
        { name: { contains: name } },
        { description: { contains: name } },
      ];
    }

    return Promise.all([
      this.prisma.boards.findMany({
        where: baseWhere,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      this.prisma.boards.count({
        where: baseWhere,
      }),
    ]);
  }

  async createBoard({
    board,
  }: {
    board: Prisma.boardsCreateInput;
  }): Promise<BoardWithOwner> {
    return this.prisma.boards.create({
      include: {
        user: true,
      },
      data: board,
    });
  }

  async updateBoard({
    id,
    board,
  }: {
    id: string;
    board: Prisma.boardsUpdateInput;
  }): Promise<boards> {
    const { ...data } = board;
    return this.prisma.boards.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  async deleteBoard({id, userId}: {id: string, userId: string}): Promise<boards> {
    return this.prisma.boards.update({
      where: { id: id, userId: userId },
      data: {
        deletedAt: new Date(),
        status: BoardStatus.INACTIVE,
      },
    });
  }
}
