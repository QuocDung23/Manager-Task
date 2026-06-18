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
}
