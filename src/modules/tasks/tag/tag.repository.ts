import {
  Prisma,
  PrismaClient,
  tags,
  TagStatus,
  TaskStatus,
} from "@prisma/client";
import { PrismaService } from "@/modules/data/prisma.client";
import { taskDetailsInclude, TaskWithDetails } from "../task.repository";

type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class TaskTagRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async getTagsByBoardId(args: {
    boardId: string;
    name?: string;
    includeDeleted?: boolean;
  }): Promise<tags[]> {
    const { boardId, name, includeDeleted } = args;

    const where: Prisma.tagsWhereInput = {
      boardId,
      ...(includeDeleted ? {} : { deletedAt: null }),
    };

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    return this.prisma.tags.findMany({
      where,
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    });
  }

  async getTagByIdInBoard(args: {
    boardId: string;
    tagId: string;
    includeDeleted?: boolean;
  }): Promise<tags | null> {
    const { boardId, tagId, includeDeleted } = args;
    return this.prisma.tags.findFirst({
      where: {
        id: tagId,
        boardId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findTagByNormalizedName(args: {
    boardId: string;
    nameNormalized: string;
  }): Promise<tags | null> {
    return this.prisma.tags.findFirst({
      where: {
        boardId: args.boardId,
        nameNormalized: args.nameNormalized,
      },
    });
  }

  async createTag(data: Prisma.tagsCreateInput): Promise<tags> {
    return this.prisma.tags.create({ data });
  }

  async reviveTag(args: {
    tagId: string;
    name: string;
    nameNormalized: string;
    color: string;
  }): Promise<tags> {
    return this.prisma.tags.update({
      where: { id: args.tagId },
      data: {
        name: args.name,
        nameNormalized: args.nameNormalized,
        color: args.color,
        status: TagStatus.ACTIVE,
        deletedAt: null,
      },
    });
  }

  async updateTag(args: {
    tagId: string;
    data: Prisma.tagsUpdateInput;
  }): Promise<tags> {
    return this.prisma.tags.update({
      where: { id: args.tagId },
      data: args.data,
    });
  }

  async softDeleteTagWithTaskTags(tagId: string): Promise<tags> {
    return this.prisma.$transaction(async (tx) => {
      await tx.taskTags.updateMany({
        where: {
          tagId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return tx.tags.update({
        where: { id: tagId },
        data: {
          status: TagStatus.INACTIVE,
          deletedAt: new Date(),
        },
      });
    });
  }

  async getActiveTagsByIdsInBoard(args: {
    boardId: string;
    tagIds: string[];
  }): Promise<tags[]> {
    if (!args.tagIds || args.tagIds.length === 0) return [];
    return this.prisma.tags.findMany({
      where: {
        boardId: args.boardId,
        id: { in: args.tagIds },
        deletedAt: null,
        status: TagStatus.ACTIVE,
      },
    });
  }

  async replaceTaskTags(args: {
    taskId: string;
    tagIds: string[];
  }): Promise<TaskWithDetails | null> {
    const uniqueTagIds = Array.from(new Set(args.tagIds));

    return this.prisma.$transaction(async (tx) => {
      await tx.taskTags.updateMany({
        where: {
          taskId: args.taskId,
          deletedAt: null,
          ...(uniqueTagIds.length > 0
            ? { tagId: { notIn: uniqueTagIds } }
            : {}),
        },
        data: {
          deletedAt: new Date(),
        },
      });

      for (const tagId of uniqueTagIds) {
        await this.upsertTaskTag({
          tx,
          taskId: args.taskId,
          tagId,
        });
      }

      await tx.tasks.update({
        where: { id: args.taskId },
        data: { tagVersion: { increment: 1 } },
      });

      return tx.tasks.findFirst({
        where: {
          id: args.taskId,
          deletedAt: null,
        },
        include: taskDetailsInclude,
      });
    });
  }

  async attachTaskTag(args: {
    taskId: string;
    tagId: string;
  }): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      await this.upsertTaskTag({
        tx,
        taskId: args.taskId,
        tagId: args.tagId,
      });

      await tx.tasks.update({
        where: { id: args.taskId },
        data: { tagVersion: { increment: 1 } },
      });

      return tx.tasks.findFirst({
        where: {
          id: args.taskId,
          deletedAt: null,
        },
        include: taskDetailsInclude,
      });
    });
  }

  async getActiveTaskTag(args: {
    taskId: string;
    tagId: string;
  }): Promise<{ id: string; deletedAt: Date | null } | null> {
    return this.prisma.taskTags.findFirst({
      where: {
        taskId: args.taskId,
        tagId: args.tagId,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });
  }

  async detachTaskTag(args: {
    taskId: string;
    tagId: string;
  }): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.taskTags.updateMany({
        where: {
          taskId: args.taskId,
          tagId: args.tagId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.tasks.update({
        where: { id: args.taskId },
        data: { tagVersion: { increment: 1 } },
      });

      return tx.tasks.findFirst({
        where: {
          id: args.taskId,
          deletedAt: null,
        },
        include: taskDetailsInclude,
      });
    });
  }

  async getTasksByTagInBoard(args: {
    boardId: string;
    tagId: string;
    listId?: string;
    name?: string;
    status?: TaskStatus;
  }): Promise<TaskWithDetails[]> {
    const where: Prisma.tasksWhereInput = {
      deletedAt: null,
      ...(args.status ? { status: args.status } : {}),
      ...(args.name
        ? { name: { contains: args.name, mode: "insensitive" } }
        : {}),
      list: {
        boardId: args.boardId,
        deletedAt: null,
        ...(args.listId ? { id: args.listId } : {}),
      },
      taskTags: {
        some: {
          tagId: args.tagId,
          deletedAt: null,
          tag: {
            deletedAt: null,
          },
        },
      },
    };

    return this.prisma.tasks.findMany({
      where,
      orderBy: [{ list: { order: "asc" } }, { orderTask: "asc" }],
      include: taskDetailsInclude,
    });
  }

  private async upsertTaskTag(args: {
    tx: PrismaTx;
    taskId: string;
    tagId: string;
  }): Promise<void> {
    const client = args.tx as PrismaClient;
    const existing = await client.taskTags.findFirst({
      where: {
        taskId: args.taskId,
        tagId: args.tagId,
      },
    });

    if (existing) {
      if (existing.deletedAt !== null) {
        await client.taskTags.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
          },
        });
      }
      return;
    }

    await client.taskTags.create({
      data: {
        taskId: args.taskId,
        tagId: args.tagId,
      },
    });
  }
}
