import { boardMembers, BoardMemberStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../data/prisma.client";

const boardMemberWithUserInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.boardMembersInclude;

export type BoardMemberWithUser = Prisma.boardMembersGetPayload<{
  include: typeof boardMemberWithUserInclude;
}>;

export class BoardMemberRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  addMemberOfBoard(
    userId: string,
    boardId: string,
    roleId: string,
  ): Promise<boardMembers> {
    return this.prisma.boardMembers.create({
      data: {
        userId,
        boardId,
        roleId,
      },
    });
  }

  async checkMemberOfBoard(boardId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.boardMembers.findFirst({
      where: {
        boardId,
        userId,
        status: BoardMemberStatus.ACTIVE,
        deletedAt: null,
      },
    });
    return !!member;
  }

  /**
   * Lấy danh sách boardMembers ACTIVE (chưa soft delete) của board,
   * có userId nằm trong tập `userIds`.
   *
   * Trả về các bản ghi thoả mãn điều kiện; service sẽ đối chiếu length để biết
   * có user nào không thuộc board hay không.
   */
  getActiveBoardMembersByUserIds(
    boardId: string,
    userIds: string[],
  ): Promise<boardMembers[]> {
    if (!userIds || userIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.boardMembers.findMany({
      where: {
        boardId,
        userId: { in: userIds },
        status: BoardMemberStatus.ACTIVE,
        deletedAt: null,
      },
    });
  }

  getActiveBoardMembersWithUser(
    boardId: string,
  ): Promise<BoardMemberWithUser[]> {
    return this.prisma.boardMembers.findMany({
      where: {
        boardId,
        status: BoardMemberStatus.ACTIVE,
        deletedAt: null,
      },
      include: boardMemberWithUserInclude,
      orderBy: { createdAt: "asc" },
    });
  }

  getActiveBoardMemberWithUser(
    boardId: string,
    userId: string,
  ): Promise<BoardMemberWithUser | null> {
    return this.prisma.boardMembers.findFirst({
      where: {
        boardId,
        userId,
        status: BoardMemberStatus.ACTIVE,
        deletedAt: null,
      },
      include: boardMemberWithUserInclude,
    });
  }

  async updateActiveMemberRole(
    boardId: string,
    userId: string,
    roleId: string,
  ): Promise<BoardMemberWithUser | null> {
    const member = await this.prisma.boardMembers.findFirst({
      where: {
        boardId,
        userId,
        status: BoardMemberStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!member) return null;

    return this.prisma.boardMembers.update({
      where: { id: member.id },
      data: { roleId },
      include: boardMemberWithUserInclude,
    });
  }
}
