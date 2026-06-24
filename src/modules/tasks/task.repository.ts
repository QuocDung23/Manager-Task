import { Prisma, TaskStatus, tasks } from "@prisma/client";
import { PrismaService } from "../data/prisma.client";

export class TaskRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async getTasks(args: {
    listId: string;
    status?: TaskStatus;
    name?: string;
  }): Promise<tasks[]> {
    const { listId, status, name } = args;

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

    return this.prisma.tasks.findMany({
      where,
      orderBy: {
        orderTask: "asc",
      },
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
}
