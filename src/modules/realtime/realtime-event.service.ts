import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";
import { TaskResponseDto } from "@/modules/tasks/dtos/response";
import {
  taskRoom,
  TaskDueSoonPayload,
  TaskOverdueLockedPayload,
  UserNotificationPayload,
  userRoom,
} from "./realtime.types";
import { Server } from "socket.io";

/**
 * Service emit realtime event tới các client đang subscribe.
 * Lấy io instance qua `setIO()` khi server bootstrap.
 */
export class RealtimeEventService {
  private io: Server | null = null;

  setIO(io: Server) {
    this.io = io;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emitToRoom(taskId: string, event: string, payload: any) {
    if (!this.io) return;
    this.io.to(taskRoom(taskId)).emit(event, payload);
  }

  private emitToUser(userId: string, event: string, payload: unknown) {
    if (!this.io) return;
    this.io.to(userRoom(userId)).emit(event, payload as any);
  }

  emitTaskCommentCreated(taskId: string, comment: CommentResponseDto) {
    this.emitToRoom(taskId, "task:comment_created", { taskId, comment });
  }

  emitTaskCommentReplied(
    taskId: string,
    parentCommentId: string,
    reply: CommentResponseDto,
  ) {
    this.emitToRoom(taskId, "task:comment_replied", {
      taskId,
      parentCommentId,
      reply,
    });
  }

  emitTaskCommentUpdated(taskId: string, comment: CommentResponseDto) {
    this.emitToRoom(taskId, "task:comment_updated", { taskId, comment });
  }

  emitTaskCommentReplyUpdated(
    taskId: string,
    parentCommentId: string,
    reply: CommentResponseDto,
  ) {
    this.emitToRoom(taskId, "task:comment_reply_updated", {
      taskId,
      parentCommentId,
      reply,
    });
  }

  emitTaskCommentDeleted(
    taskId: string,
    commentId: string,
    comment: CommentResponseDto,
    deletedReplyIds?: string[],
  ) {
    this.emitToRoom(taskId, "task:comment_deleted", {
      taskId,
      commentId,
      comment,
      deletedReplyIds,
    });
  }

  emitTaskCommentReplyDeleted(
    taskId: string,
    parentCommentId: string,
    replyId: string,
    reply: CommentResponseDto,
  ) {
    this.emitToRoom(taskId, "task:comment_reply_deleted", {
      taskId,
      parentCommentId,
      replyId,
      reply,
    });
  }

  emitTaskScheduleUpdated(taskId: string, task: TaskResponseDto) {
    this.emitToRoom(taskId, "task:schedule_updated", { taskId, task });
  }

  emitTaskRescheduled(taskId: string, task: TaskResponseDto) {
    this.emitToRoom(taskId, "task:rescheduled", { taskId, task });
  }

  emitTaskUnlocked(taskId: string, task: TaskResponseDto) {
    this.emitToRoom(taskId, "task:unlocked", { taskId, task });
  }

  emitTaskDueSoon(taskId: string, payload: TaskDueSoonPayload) {
    this.emitToRoom(taskId, "task:due_soon", payload);
  }

  emitTaskOverdueLocked(taskId: string, payload: TaskOverdueLockedPayload) {
    this.emitToRoom(taskId, "task:overdue_locked", payload);
  }

  emitUserNotification(userId: string, notification: UserNotificationPayload) {
    this.emitToUser(userId, "notification:new", notification);
  }
}

export const realtimeEventService = new RealtimeEventService();
