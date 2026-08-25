import { NotificationPriority, Prisma } from "@prisma/client";
import { PrismaService } from "@/modules/data/prisma.client";

export type CreateNotificationInput = {
  recipientId: string;
  actorId?: string | null;
  type: string;
  priority?: NotificationPriority;
  title: string;
  body: string;
  projectId?: string | null;
  boardId?: string | null;
  taskId?: string | null;
  commentId?: string | null;
  data?: Prisma.InputJsonValue;
  dedupeKey: string;
};

export type NotificationRow = {
  id: string;
  recipientId: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  projectId: string | null;
  boardId: string | null;
  taskId: string | null;
  commentId: string | null;
  data: Prisma.JsonValue;
  readAt: Date | null;
  createdAt: Date;
  actor: { id: string; name: string; avatar: string | null } | null;
};

export type CreateNotificationResult = {
  notification: NotificationRow;
  created: boolean;
};

const include = {
  actor: { select: { id: true, name: true, avatar: true } },
} as const;

export class NotificationRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async upsertOne(input: CreateNotificationInput): Promise<CreateNotificationResult> {
    const existing = await this.prisma.notifications.findUnique({
      where: { recipientId_dedupeKey: { recipientId: input.recipientId, dedupeKey: input.dedupeKey } },
      include,
    });
    if (existing) {
      return { notification: existing, created: false };
    }
    const notification = await this.prisma.notifications.create({
      data: {
        ...input,
        actorId: input.actorId ?? null,
        priority: input.priority ?? NotificationPriority.NORMAL,
        projectId: input.projectId ?? null,
        boardId: input.boardId ?? null,
        taskId: input.taskId ?? null,
        commentId: input.commentId ?? null,
        data: input.data ?? {},
      },
      include,
    });
    return { notification, created: true };
  }

  async createMany(inputs: CreateNotificationInput[]): Promise<CreateNotificationResult[]> {
    const results: CreateNotificationResult[] = [];
    for (const input of inputs) {
      const result = await this.upsertOne(input);
      results.push(result);
    }
    return results;
  }

  list(recipientId: string, filter: "all" | "unread", cursor?: string, limit = 20) {
    return this.prisma.notifications.findMany({
      where: { recipientId, ...(filter === "unread" ? { readAt: null } : {}) },
      include,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  countUnread(recipientId: string) {
    return this.prisma.notifications.count({ where: { recipientId, readAt: null } });
  }

  async setReadState(recipientId: string, id: string, read: boolean) {
    const existing = await this.prisma.notifications.findFirst({
      where: { id, recipientId },
    });
    if (!existing) return null;
    return this.prisma.notifications.update({
      where: { id },
      data: { readAt: read ? existing.readAt ?? new Date() : null },
      include,
    });
  }

  async markAllRead(recipientId: string, before: Date) {
    const readAt = new Date();
    const result = await this.prisma.notifications.updateMany({
      where: { recipientId, readAt: null, createdAt: { lte: before } },
      data: { readAt },
    });
    return { readAt, affectedCount: result.count };
  }
}
