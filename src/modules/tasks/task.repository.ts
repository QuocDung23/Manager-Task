import { Prisma, PrismaClient, tags, TaskStatus, tasks } from "@prisma/client";
import { PrismaService } from "../data/prisma.client";

type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type TaskAssignmentLite = {
  id: string;
  taskId: string;
  userId: string;
  assignedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type TaskTagLite = {
  id: string;
  taskId: string;
  tagId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  tag: tags;
};

// Type dùng chung: task có include assignment và tag active.
export type TaskWithDetails = tasks & {
  taskAssignments?: TaskAssignmentLite[];
  taskTags?: TaskTagLite[];
};

// Backward compatible alias cho các service đang import tên cũ.
export type TaskWithAssignments = TaskWithDetails;

export const taskDetailsInclude = {
  taskAssignments: {
    where: { deletedAt: null },
  },
  taskTags: {
    where: {
      deletedAt: null,
      tag: {
        deletedAt: null,
      },
    },
    include: {
      tag: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.tasksInclude;

export class TaskRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async getTasks(args: {
    listId: string;
    status?: TaskStatus;
    name?: string;
    tagIds?: string[];
    tagMode?: "ANY" | "ALL";
  }): Promise<TaskWithDetails[]> {
    const { listId, status, name, tagIds, tagMode = "ANY" } = args;

    const where: Prisma.tasksWhereInput = {
      listId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    const uniqueTagIds = tagIds ? Array.from(new Set(tagIds)) : [];
    if (uniqueTagIds.length > 0) {
      if (tagMode === "ALL") {
        where.AND = uniqueTagIds.map((tagId) => ({
          taskTags: {
            some: {
              tagId,
              deletedAt: null,
              tag: {
                deletedAt: null,
              },
            },
          },
        }));
      } else {
        where.taskTags = {
          some: {
            tagId: { in: uniqueTagIds },
            deletedAt: null,
            tag: {
              deletedAt: null,
            },
          },
        };
      }
    }

    return this.prisma.tasks.findMany({
      where,
      orderBy: {
        orderTask: "asc",
      },
      include: taskDetailsInclude,
    });
  }

  async getTaskById(id: string): Promise<tasks | null> {
    return this.prisma.tasks.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Lấy task active kèm quan hệ `taskAssignments` (chỉ những record chưa bị soft delete).
   * Dùng cho các endpoint cần trả về `assign` trong response.
   */
  async getTaskByIdWithAssignments(
    id: string,
    tx?: PrismaTx,
  ): Promise<TaskWithDetails | null> {
    const client = (tx ?? this.prisma) as PrismaClient;
    return client.tasks.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: taskDetailsInclude,
    });
  }

  /**
   * Lấy task active kèm quan hệ `list` để tiện suy ra `boardId`.
   */
  async getTaskWithList(
    id: string,
  ): Promise<
    | (tasks & {
        list: { id: string; boardId: string; deletedAt: Date | null } | null;
      })
    | null
  > {
    return this.prisma.tasks.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        list: {
          select: {
            id: true,
            boardId: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  async createTask(data: Prisma.tasksCreateInput): Promise<tasks> {
    return this.prisma.tasks.create({ data });
  }

  async updateTask(id: string, data: Prisma.tasksUpdateInput): Promise<tasks> {
    return this.prisma.tasks.update({
      where: { id },
      data,
    });
  }

  async deleteTask(id: string): Promise<tasks> {
    return this.prisma.tasks.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: TaskStatus.INACTIVE,
      },
    });
  }

  // Lấy max orderTask trong 1 list (chỉ tính task active).
  // Trả về 0 nếu list rỗng / chưa có task.
  async getMaxOrderTask(listId: string): Promise<number> {
    const agg = await this.prisma.tasks.aggregate({
      where: {
        listId,
        deletedAt: null,
      },
      _max: { orderTask: true },
    });
    return agg._max.orderTask ?? 0;
  }

  // Lấy toàn bộ task active trong 1 list, sort theo orderTask ASC.
  async getTasksByListId(listId: string): Promise<tasks[]> {
    return this.prisma.tasks.findMany({
      where: {
        listId,
        deletedAt: null,
      },
      orderBy: {
        orderTask: "asc",
      },
    });
  }

  /**
   * Lấy task active trong 1 list, kèm quan hệ `taskAssignments` (chỉ record active).
   * Dùng cho response moveTask/getAllTasks để field `assign` luôn đúng.
   */
  async getTasksWithAssignmentsByListId(
    listId: string,
  ): Promise<TaskWithDetails[]> {
    return this.prisma.tasks.findMany({
      where: {
        listId,
        deletedAt: null,
      },
      orderBy: {
        orderTask: "asc",
      },
      include: taskDetailsInclude,
    });
  }

  /**
   * Lấy task active theo danh sách id (không sort theo orderTask cố định).
   * Trả về kèm `taskAssignments` active.
   */
  async getTasksWithAssignmentsByIds(
    taskIds: string[],
  ): Promise<TaskWithDetails[]> {
    if (!taskIds || taskIds.length === 0) return [];
    return this.prisma.tasks.findMany({
      where: {
        id: { in: taskIds },
        deletedAt: null,
      },
      include: taskDetailsInclude,
    });
  }

  // Lấy task active theo danh sách id, sort theo orderTask ASC.
  async getTasksByIds(taskIds: string[]): Promise<tasks[]> {
    if (!taskIds || taskIds.length === 0) return [];
    return this.prisma.tasks.findMany({
      where: {
        id: { in: taskIds },
        deletedAt: null,
      },
      orderBy: {
        orderTask: "asc",
      },
    });
  }

  // Update nhiều task trong transaction.
  // Mỗi update có thể đổi orderTask, và tuỳ chọn đổi listId (dùng cho move task sang list khác).
  async updateTaskOrders(
    updates: Array<{ id: string; listId?: string; orderTask: number }>,
  ): Promise<tasks[]> {
    if (!updates || updates.length === 0) return [];

    return this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.tasks.update({
          where: { id: u.id },
          data: {
            orderTask: u.orderTask,
            ...(u.listId ? { listId: u.listId } : {}),
          },
        }),
      ),
    );
  }

  /**
   * Replace toàn bộ assignment active của task bằng tập `userIds` mới.
   *
   * Flow trong transaction:
   *  1. Soft delete các assignment active hiện tại mà userId KHÔNG nằm trong `userIds`.
   *  2. Với từng userId trong `userIds`:
   *     - nếu đã có record (kể cả đã soft delete) → update deletedAt = null, đồng thời set assignedById.
   *     - nếu chưa có → create mới.
   *  3. Trả về task active kèm các assignment active (không bao gồm bản ghi đã soft delete).
   */
  async replaceTaskAssignments(
    taskId: string,
    userIds: string[],
    assignedById?: string,
  ): Promise<TaskWithDetails | null> {
    const uniqueUserIds = Array.from(new Set(userIds));

    return this.prisma.$transaction(async (tx) => {
      // 1. soft delete các assignment active hiện tại không nằm trong userIds
      await tx.taskAssignments.updateMany({
        where: {
          taskId,
          deletedAt: null,
          ...(uniqueUserIds.length > 0
            ? { userId: { notIn: uniqueUserIds } }
            : {}),
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // 2. với từng userId: revive record cũ hoặc tạo mới
      for (const userId of uniqueUserIds) {
        const existing = await tx.taskAssignments.findFirst({
          where: {
            taskId,
            userId,
          },
        });

        if (existing) {
          // update nếu khác trạng thái
          if (existing.deletedAt !== null || existing.assignedById !== (assignedById ?? null)) {
            await tx.taskAssignments.update({
              where: { id: existing.id },
              data: {
                deletedAt: null,
                ...(assignedById !== undefined ? { assignedById } : {}),
              },
            });
          }
        } else {
          await tx.taskAssignments.create({
            data: {
              taskId,
              userId,
              ...(assignedById ? { assignedById } : {}),
            },
          });
        }
      }

      // 3. trả task + assignment active
      return tx.tasks.findFirst({
        where: {
          id: taskId,
          deletedAt: null,
        },
        include: taskDetailsInclude,
      });
    });
  }

  /**
   * Lấy assignment active của (taskId, userId).
   * Dùng cho unassign để kiểm tra record có tồn tại chưa soft delete hay không.
   */
  async getTaskAssignment(
    taskId: string,
    userId: string,
  ): Promise<{ id: string; deletedAt: Date | null } | null> {
    return this.prisma.taskAssignments.findFirst({
      where: {
        taskId,
        userId,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });
  }

  /**
   * Soft delete 1 assignment (taskId, userId) nếu đang active.
   * Trả về task active kèm assignment active sau khi xoá.
   */
  async removeTaskAssignment(
    taskId: string,
    userId: string,
  ): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.taskAssignments.updateMany({
        where: {
          taskId,
          userId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return tx.tasks.findFirst({
        where: {
          id: taskId,
          deletedAt: null,
        },
        include: taskDetailsInclude,
      });
    });
  }
}
