import { Prisma, PrismaClient, taskComments } from "@prisma/client";
import { PrismaService } from "@/modules/data/prisma.client";

type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type CommentWithUser = taskComments & {
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

const userLiteSelect = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
} satisfies Prisma.taskCommentsInclude;

export class TaskCommentRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  /**
   * Lấy danh sách comment gốc (`parentCommentId = null`) của task, sort theo `createdAt DESC`.
   * Hỗ trợ cursor pagination theo id (cursor sẽ được map sang `createdAt` của comment đó).
   */
  async getRootCommentsByTaskId(args: {
    taskId: string;
    cursor?: string;
    limit: number;
  }): Promise<CommentWithUser[]> {
    const { taskId, cursor, limit } = args;

    let cursorDate: Date | undefined;
    if (cursor) {
      const cursorComment = await this.prisma.taskComments.findFirst({
        where: { id: cursor, taskId, deletedAt: null },
        select: { createdAt: true },
      });
      cursorDate = cursorComment?.createdAt;
    }

    return this.prisma.taskComments.findMany({
      where: {
        taskId,
        parentCommentId: null,
        deletedAt: null,
      },
      ...(cursorDate
        ? {
            cursor: { createdAt: cursorDate } as any,
            skip: 1,
          }
        : {}),
      orderBy: { createdAt: "desc" },
      take: limit,
      include: userLiteSelect,
    }) as unknown as Promise<CommentWithUser[]>;
  }

  /**
   * Lấy danh sách reply (`parentCommentId = commentId`) của một comment gốc.
   */
  async getRepliesByCommentId(args: {
    taskId: string;
    parentCommentId: string;
    cursor?: string;
    limit: number;
  }): Promise<CommentWithUser[]> {
    const { taskId, parentCommentId, cursor, limit } = args;

    let cursorDate: Date | undefined;
    if (cursor) {
      const cursorReply = await this.prisma.taskComments.findFirst({
        where: { id: cursor, taskId, parentCommentId, deletedAt: null },
        select: { createdAt: true },
      });
      cursorDate = cursorReply?.createdAt;
    }

    return this.prisma.taskComments.findMany({
      where: {
        taskId,
        parentCommentId,
        deletedAt: null,
      },
      ...(cursorDate
        ? {
            cursor: { createdAt: cursorDate } as any,
            skip: 1,
          }
        : {}),
      orderBy: { createdAt: "desc" },
      take: limit,
      include: userLiteSelect,
    }) as unknown as Promise<CommentWithUser[]>;
  }

  /**
   * Lấy comment theo id, đảm bảo đang active và thuộc đúng taskId.
   */
  async getActiveCommentById(args: {
    commentId: string;
    taskId: string;
  }): Promise<CommentWithUser | null> {
    return this.prisma.taskComments.findFirst({
      where: {
        id: args.commentId,
        taskId: args.taskId,
        deletedAt: null,
      },
      include: userLiteSelect,
    }) as unknown as Promise<CommentWithUser | null>;
  }

  async createComment(data: {
    taskId: string;
    userId: string;
    parentCommentId?: string;
    content: string;
    tx?: PrismaTx;
  }): Promise<CommentWithUser> {
    const client = (data.tx ?? this.prisma) as PrismaClient;
    return client.taskComments.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        content: data.content,
        ...(data.parentCommentId
          ? { parentCommentId: data.parentCommentId }
          : {}),
      },
      include: userLiteSelect,
    }) as unknown as CommentWithUser;
  }

  async updateComment(args: {
    commentId: string;
    content: string;
  }): Promise<CommentWithUser> {
    return this.prisma.taskComments.update({
      where: { id: args.commentId },
      data: { content: args.content },
      include: userLiteSelect,
    }) as unknown as CommentWithUser;
  }

  /**
   * Soft delete 1 comment. Trả về comment sau khi cập nhật.
   */
  async softDeleteComment(commentId: string): Promise<CommentWithUser> {
    return this.prisma.taskComments.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
      include: userLiteSelect,
    }) as unknown as CommentWithUser;
  }

  /**
   * Soft delete comment gốc + tất cả reply đang active của nó trong cùng transaction.
   * Trả về comment gốc đã xoá và danh sách id của các reply đã bị soft delete.
   */
  async softDeleteCommentWithReplies(commentId: string): Promise<{
    comment: CommentWithUser;
    deletedReplyIds: string[];
  }> {
    return this.prisma.$transaction(async (tx) => {
      const activeReplies = await tx.taskComments.findMany({
        where: { parentCommentId: commentId, deletedAt: null },
        select: { id: true },
      });
      const replyIds = activeReplies.map((r) => r.id);

      if (replyIds.length > 0) {
        await tx.taskComments.updateMany({
          where: { id: { in: replyIds } },
          data: { deletedAt: new Date() },
        });
      }

      const comment = (await tx.taskComments.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
        include: userLiteSelect,
      })) as unknown as CommentWithUser;

      return { comment, deletedReplyIds: replyIds };
    });
  }

  /**
   * Đếm số reply active của comment cha.
   */
  async countActiveReplies(parentCommentId: string): Promise<number> {
    return this.prisma.taskComments.count({
      where: { parentCommentId, deletedAt: null },
    });
  }
}
