import { PrismaService } from "@/modules/data/prisma.client";
import type { CreateTaskActivityInput } from "./task-activity.types";

const activityInclude = {
  actor: { select: { id: true, name: true, avatar: true } },
} as const;

export class TaskActivityRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  create(input: CreateTaskActivityInput) {
    return this.prisma.taskActivities.create({
      data: {
        taskId: input.taskId,
        actorId: input.actorId ?? null,
        type: input.type,
        metadata: input.metadata ?? {},
        dedupeKey: input.dedupeKey ?? null,
      },
      include: activityInclude,
    });
  }

  async list(taskId: string, cursor?: string, limit = 20) {
    return this.prisma.taskActivities.findMany({
      where: { taskId },
      include: activityInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }
}
