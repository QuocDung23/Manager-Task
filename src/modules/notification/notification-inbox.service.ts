import { NotificationPriority } from "@prisma/client";
import { NotFoundException } from "@/common";
import { realtimeEventService } from "@/modules/realtime";
import {
  NotificationRepository,
  type CreateNotificationInput,
  type NotificationRow,
} from "./notification.repository";

export type NotificationResponse = {
  id: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  actor: { id: string; name: string; avatar: string | null } | null;
  context: {
    projectId: string | null;
    boardId: string | null;
    taskId: string | null;
    commentId: string | null;
  };
  data: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
};

function toResponse(row: NotificationRow): NotificationResponse {
  return {
    id: row.id,
    type: row.type,
    priority: row.priority,
    title: row.title,
    body: row.body,
    actor: row.actor,
    context: {
      projectId: row.projectId,
      boardId: row.boardId,
      taskId: row.taskId,
      commentId: row.commentId,
    },
    data:
      row.data && typeof row.data === "object" && !Array.isArray(row.data)
        ? (row.data as Record<string, unknown>)
        : {},
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export class NotificationInboxService {
  constructor(private readonly repository = new NotificationRepository()) {}

  async createForRecipients(
    input: Omit<CreateNotificationInput, "recipientId" | "dedupeKey"> & {
      recipientIds: string[];
      dedupeKey: (recipientId: string) => string;
    },
  ) {
    const recipientIds = [...new Set(input.recipientIds)].filter(
      (id) => id && id !== input.actorId,
    );
    const { recipientIds: _, dedupeKey: __, ...rest } = input;
    const results = await this.repository.createMany(
      recipientIds.map((recipientId) => ({
        ...rest,
        recipientId,
        dedupeKey: input.dedupeKey(recipientId),
      })),
    );
    const notifications = results.map((result) => toResponse(result.notification));
    results.forEach((result, index) => {
      if (result.created) {
        realtimeEventService.emitNotificationCreated(recipientIds[index], notifications[index]);
      }
    });
    return notifications;
  }

  async list(recipientId: string, filter: "all" | "unread", cursor?: string, requestedLimit = 20) {
    const limit = Math.min(50, Math.max(1, requestedLimit || 20));
    const rows = await this.repository.list(recipientId, filter, cursor, limit);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(toResponse);
    return { success: true as const, data: { items, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null } };
  }

  async unreadCount(recipientId: string) {
    return { success: true as const, data: { count: await this.repository.countUnread(recipientId) } };
  }

  async setReadState(recipientId: string, id: string, read: boolean) {
    const row = await this.repository.setReadState(recipientId, id, read);
    if (!row) throw new NotFoundException("Notification not found");
    const notification = toResponse(row);
    realtimeEventService.emitNotificationReadStateChanged(recipientId, id, notification.readAt);
    return { success: true as const, data: notification };
  }

  async markAllRead(recipientId: string, before: Date) {
    const result = await this.repository.markAllRead(recipientId, before);
    realtimeEventService.emitNotificationReadAll(recipientId, before, result.readAt);
    return { success: true as const, data: { ...result, before } };
  }
}

export const notificationInboxService = new NotificationInboxService();
