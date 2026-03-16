import { boardMembers, BoardMemberStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../data/prisma.client";

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
      }
    });
  }

  async checkMemberOfBoard(boardId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.boardMembers.findFirst({
      where: {
        boardId,
        userId,
        status: BoardMemberStatus.ACTIVE,
      }
    });
    return !!member;
  }
}
