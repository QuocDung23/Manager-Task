import {
  Prisma,
  PrismaClient,
  tags,
  TaskLockStatus,
  TaskScheduleEventType,
  TaskStatus,
  TaskStatusAction,
  tasks,
  UserStatus,
} from "@prisma/client";
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

export type TaskScheduleStateFilter =
  | "none"
  | "scheduled"
  | "due_soon"
  | "overdue_locked"
  | "done";

export class TaskRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async getTasks(args: {
    listId: string;
    status?: TaskStatus;
    name?: string;
    tagIds?: string[];
    tagMode?: "ANY" | "ALL";
    dueBefore?: Date;
    dueAfter?: Date;
    scheduleState?: TaskScheduleStateFilter;
    lockStatus?: TaskLockStatus;
    dueSoonBefore?: Date;
    now?: Date;
  }): Promise<TaskWithDetails[]> {
    const {
      listId,
      status,
      name,
      tagIds,
      tagMode = "ANY",
      dueBefore,
      dueAfter,
      scheduleState,
      lockStatus,
      dueSoonBefore,
      now = new Date(),
    } = args;

    const where: Prisma.tasksWhereInput = {
      listId,
      deletedAt: null,
    };
    const andConditions: Prisma.tasksWhereInput[] = [];

    if (status) {
      where.status = status;
    }

    if (lockStatus) {
      where.lockStatus = lockStatus;
    }

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (dueBefore || dueAfter) {
      where.dueDate = {
        ...(dueAfter ? { gte: dueAfter } : {}),
        ...(dueBefore ? { lte: dueBefore } : {}),
      };
    }

    if (scheduleState) {
      if (scheduleState === "none") {
        where.dueDate = null;
      }

      if (scheduleState === "scheduled") {
        andConditions.push({
          dueDate: { not: null, gt: now },
          lockStatus: TaskLockStatus.UNLOCKED,
          statusAction: { notIn: [TaskStatusAction.DONE, TaskStatusAction.CANCELLED] },
        });
      }

      if (scheduleState === "due_soon") {
        andConditions.push({
          dueDate: { not: null, gt: now },
          lockStatus: TaskLockStatus.UNLOCKED,
          statusAction: { notIn: [TaskStatusAction.DONE, TaskStatusAction.CANCELLED] },
          OR: [
            {
              reminderAt: {
                lte: now,
              },
            },
            {
              reminderAt: null,
              dueDate: {
                lte: dueSoonBefore ?? now,
              },
            },
          ],
        });
      }

      if (scheduleState === "overdue_locked") {
        where.lockStatus = TaskLockStatus.OVERDUE_LOCKED;
      }

      if (scheduleState === "done") {
        where.statusAction = TaskStatusAction.DONE;
      }
    }

    const uniqueTagIds = tagIds ? Array.from(new Set(tagIds)) : [];
    if (uniqueTagIds.length > 0) {
      if (tagMode === "ALL") {
        andConditions.push(...uniqueTagIds.map((tagId) => ({
          taskTags: {
            some: {
              tagId,
              deletedAt: null,
              tag: {
                deletedAt: null,
              },
            },
          },
        })));
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

    if (andConditions.length > 0) {
      where.AND = andConditions;
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

  async createTask(
    data: Prisma.tasksCreateInput,
    scheduleEvent?: {
      actorId?: string;
      newDueDate: Date;
      reason?: string;
      metadata?: Prisma.InputJsonValue;
    },
  ): Promise<tasks> {
    if (!scheduleEvent) {
      return this.prisma.tasks.create({ data });
    }

    return this.prisma.$transaction(async (tx) => {
      const task = await tx.tasks.create({ data });
      await tx.taskScheduleEvents.create({
        data: {
          taskId: task.id,
          actorId: scheduleEvent.actorId,
          type: TaskScheduleEventType.SCHEDULED,
          newDueDate: scheduleEvent.newDueDate,
          reason: scheduleEvent.reason,
          metadata: scheduleEvent.metadata,
        },
      });
      return task;
    });
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
   *  3. Increment `assignmentVersion` trên task.
   *  4. Trả về task active kèm các assignment active (không bao gồm bản ghi đã soft delete).
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

      // 3. increment assignmentVersion
      await tx.tasks.update({
        where: { id: taskId },
        data: { assignmentVersion: { increment: 1 } },
      });

      // 4. trả task + assignment active
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
   * Kiểm tra một user có đang là assignee active của task hay không.
   * Record `taskAssignments` được coi là active khi `deletedAt = null`
   * và task cũng phải chưa bị soft delete (đã được middleware check trước).
   */
  async isTaskAssignee(taskId: string, userId: string): Promise<boolean> {
    const assignment = await this.prisma.taskAssignments.findFirst({
      where: {
        taskId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    return Boolean(assignment);
  }

  /**
   * Cập nhật `statusAction` cho task đang active.
   * Trả về Prisma record sau khi update (chưa include assignments).
   */
  async updateTaskStatusAction(
    id: string,
    statusAction: TaskStatusAction,
    actorId?: string,
  ): Promise<tasks> {
    const now = new Date();
    const isDone = statusAction === TaskStatusAction.DONE;

    return this.prisma.$transaction(async (tx) => {
      const task = await tx.tasks.update({
        where: { id },
        data: {
          statusAction,
          completedAt: isDone ? now : null,
          ...(isDone
            ? {
                lockStatus: TaskLockStatus.UNLOCKED,
                lockedAt: null,
                lockReason: null,
              }
            : {}),
        },
      });

      if (isDone) {
        await tx.taskScheduleEvents.create({
          data: {
            taskId: id,
            actorId,
            type: TaskScheduleEventType.COMPLETED,
            oldDueDate: task.dueDate,
            newDueDate: task.dueDate,
            metadata: {
              completedAt: now.toISOString(),
            },
          },
        });
      }

      return task;
    });
  }

  async updateTaskSchedule(args: {
    taskId: string;
    dueDate: Date;
    reminderAt?: Date | null;
    actorId?: string;
    reason?: string;
    eventType: TaskScheduleEventType;
    oldDueDate?: Date | null;
    incrementRescheduleCount?: boolean;
  }): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.tasks.update({
        where: { id: args.taskId },
        data: {
          dueDate: args.dueDate,
          reminderAt: args.reminderAt ?? null,
          reminderSentAt: null,
          overdueNotifiedAt: null,
          lockStatus: TaskLockStatus.UNLOCKED,
          lockedAt: null,
          lockReason: null,
          ...(args.incrementRescheduleCount
            ? { rescheduleCount: { increment: 1 } }
            : {}),
        },
      });

      await tx.taskScheduleEvents.create({
        data: {
          taskId: args.taskId,
          actorId: args.actorId,
          type: args.eventType,
          oldDueDate: args.oldDueDate ?? null,
          newDueDate: args.dueDate,
          reason: args.reason,
          metadata: {
            reminderAt: args.reminderAt?.toISOString() ?? null,
          },
        },
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

  async clearTaskSchedule(args: {
    taskId: string;
    actorId?: string;
    reason?: string;
    oldDueDate?: Date | null;
  }): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.tasks.update({
        where: { id: args.taskId },
        data: {
          dueDate: null,
          reminderAt: null,
          reminderSentAt: null,
          overdueNotifiedAt: null,
        },
      });

      await tx.taskScheduleEvents.create({
        data: {
          taskId: args.taskId,
          actorId: args.actorId,
          type: TaskScheduleEventType.SCHEDULE_CLEARED,
          oldDueDate: args.oldDueDate ?? null,
          newDueDate: null,
          reason: args.reason,
        },
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

  async unlockTask(args: {
    taskId: string;
    actorId?: string;
    reason: string;
    oldDueDate?: Date | null;
  }): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.tasks.update({
        where: { id: args.taskId },
        data: {
          lockStatus: TaskLockStatus.UNLOCKED,
          lockedAt: null,
          lockReason: null,
        },
      });

      await tx.taskScheduleEvents.create({
        data: {
          taskId: args.taskId,
          actorId: args.actorId,
          type: TaskScheduleEventType.UNLOCKED,
          oldDueDate: args.oldDueDate ?? null,
          newDueDate: args.oldDueDate ?? null,
          reason: args.reason,
        },
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

  async getTaskNotificationRecipients(taskId: string): Promise<string[]> {
    const assignments = await this.prisma.taskAssignments.findMany({
      where: {
        taskId,
        deletedAt: null,
        user: {
          deletedAt: null,
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        userId: true,
      },
    });

    return assignments.map((assignment) => assignment.userId);
  }

  async getTaskAssignees(
    taskId: string,
  ): Promise<Array<{ id: string; email: string; name: string }>> {
    const assignments = await this.prisma.taskAssignments.findMany({
      where: {
        taskId,
        deletedAt: null,
        user: {
          deletedAt: null,
          status: UserStatus.ACTIVE,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return assignments.map((a) => ({
      id: a.user.id,
      email: a.user.email,
      name: a.user.name,
    }));
  }

  async getTasksDueForReminder(args: {
    now: Date;
    defaultReminderAt: Date;
    take: number;
  }): Promise<TaskWithDetails[]> {
    return this.prisma.tasks.findMany({
      where: {
        deletedAt: null,
        status: TaskStatus.ACTIVE,
        statusAction: {
          notIn: [TaskStatusAction.DONE, TaskStatusAction.CANCELLED],
        },
        lockStatus: TaskLockStatus.UNLOCKED,
        reminderSentAt: null,
        dueDate: {
          gt: args.now,
        },
        OR: [
          {
            reminderAt: {
              lte: args.now,
            },
          },
          {
            reminderAt: null,
            dueDate: {
              lte: args.defaultReminderAt,
            },
          },
        ],
      },
      orderBy: {
        dueDate: "asc",
      },
      take: args.take,
      include: taskDetailsInclude,
    });
  }

  async markReminderSent(args: {
    taskId: string;
    now: Date;
    defaultReminderAt: Date;
  }): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.tasks.updateMany({
        where: {
          id: args.taskId,
          deletedAt: null,
          status: TaskStatus.ACTIVE,
          statusAction: {
            notIn: [TaskStatusAction.DONE, TaskStatusAction.CANCELLED],
          },
          lockStatus: TaskLockStatus.UNLOCKED,
          reminderSentAt: null,
          dueDate: {
            gt: args.now,
          },
          OR: [
            {
              reminderAt: {
                lte: args.now,
              },
            },
            {
              reminderAt: null,
              dueDate: {
                lte: args.defaultReminderAt,
              },
            },
          ],
        },
        data: {
          reminderSentAt: args.now,
        },
      });

      if (result.count === 0) {
        return false;
      }

      const task = await tx.tasks.findUnique({
        where: { id: args.taskId },
        select: { dueDate: true },
      });

      await tx.taskScheduleEvents.create({
        data: {
          taskId: args.taskId,
          type: TaskScheduleEventType.REMINDER_SENT,
          oldDueDate: task?.dueDate ?? null,
          newDueDate: task?.dueDate ?? null,
          metadata: {
            reminderSentAt: args.now.toISOString(),
          },
        },
      });

      return true;
    });
  }

  async getOverdueTasksToLock(args: {
    now: Date;
    take: number;
  }): Promise<TaskWithDetails[]> {
    return this.prisma.tasks.findMany({
      where: {
        deletedAt: null,
        status: TaskStatus.ACTIVE,
        statusAction: {
          notIn: [TaskStatusAction.DONE, TaskStatusAction.CANCELLED],
        },
        lockStatus: TaskLockStatus.UNLOCKED,
        dueDate: {
          lt: args.now,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: args.take,
      include: taskDetailsInclude,
    });
  }

  async lockTaskAsOverdue(
    taskId: string,
    now: Date,
    overdueBefore: Date = now,
  ): Promise<TaskWithDetails | null> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.tasks.updateMany({
        where: {
          id: taskId,
          deletedAt: null,
          lockStatus: TaskLockStatus.UNLOCKED,
          dueDate: {
            lt: overdueBefore,
          },
          statusAction: {
            notIn: [TaskStatusAction.DONE, TaskStatusAction.CANCELLED],
          },
        },
        data: {
          lockStatus: TaskLockStatus.OVERDUE_LOCKED,
          lockedAt: now,
          lockReason: "Task quá hạn hoàn thành",
          overdueNotifiedAt: now,
        },
      });

      if (result.count === 0) {
        return null;
      }

      const task = await tx.tasks.findFirst({
        where: {
          id: taskId,
          deletedAt: null,
        },
        include: taskDetailsInclude,
      });

      await tx.taskScheduleEvents.create({
        data: {
          taskId,
          type: TaskScheduleEventType.OVERDUE_LOCKED,
          oldDueDate: task?.dueDate ?? null,
          newDueDate: task?.dueDate ?? null,
          metadata: {
            lockedAt: now.toISOString(),
          },
        },
      });

      return task;
    });
  }

  /**
   * Soft delete 1 assignment (taskId, userId) nếu đang active.
   * Trả về task active kèm assignment active sau khi xoá.
   * Trong cùng transaction: soft-delete + increment assignmentVersion + query canonical.
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

      // increment assignmentVersion
      await tx.tasks.update({
        where: { id: taskId },
        data: { assignmentVersion: { increment: 1 } },
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
