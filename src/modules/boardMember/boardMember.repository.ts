import { boardMembers, Prisma } from "@prisma/client";
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
}
