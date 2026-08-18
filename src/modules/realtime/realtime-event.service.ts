import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";
import { TaskResponseDto } from "@/modules/tasks/dtos/response";
import {
  boardRoom,
  BoardTagPayload,
  taskRoom,
  TaskTagsUpdatedPayload,
  TaskDueSoonPayload,
  TaskOverdueLockedPayload,
  UserNotificationPayload,
  userRoom,
  TaskAssignmentsUpdatedPayload,
} from "./realtime.types";
import type { AppSocketServer } from "./socket.server";
import { createRealtimeEnvelope } from "./realtime-envelope";
import { TagResponseDto } from "@/modules/tasks/tag/dtos/response";

/**
 * Service emit realtime event tới các client đang subscribe.
 * Lấy io instance qua `setIO()` khi server bootstrap.
 */
export class RealtimeEventService {
  private io: AppSocketServer | null = null;

  setIO(io: AppSocketServer): void {
    this.io = io;
  }

  private emitToRoom<K extends keyof import("./realtime.types").ServerToClientEvents>(
    room: string,
    event: K,
    payload: Parameters<import("./realtime.types").ServerToClientEvents[K]>[0],
  ): void {
    if (!this.io) return;
    // Socket.IO's acknowledgement decoration widens the server event overload;
    // the generic key still couples each payload to its declared event above.
    const emitter = this.io.to(room) as unknown as {
      emit: (eventName: string, eventPayload: unknown) => void;
    };
    emitter.emit(event, payload);
  }

  private emitToUser(
    userId: string,
    event: "notification:new",
    payload: UserNotificationPayload,
  ): void {
    if (!this.io) return;
    this.io.to(userRoom(userId)).emit(event, payload);
  }

  emitTaskCommentCreated(taskId: string, comment: CommentResponseDto) {
    this.emitToRoom(taskRoom(taskId), "task:comment_created", { taskId, comment });
  }

  emitTaskCommentReplied(
    taskId: string,
    parentCommentId: string,
    reply: CommentResponseDto,
  ) {
    this.emitToRoom(taskRoom(taskId), "task:comment_replied", {
      taskId,
      parentCommentId,
      reply,
    });
  }

  emitTaskCommentUpdated(taskId: string, comment: CommentResponseDto) {
    this.emitToRoom(taskRoom(taskId), "task:comment_updated", { taskId, comment });
  }

  emitTaskCommentReplyUpdated(
    taskId: string,
    parentCommentId: string,
    reply: CommentResponseDto,
  ) {
    this.emitToRoom(taskRoom(taskId), "task:comment_reply_updated", {
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
    this.emitToRoom(taskRoom(taskId), "task:comment_deleted", {
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
    this.emitToRoom(taskRoom(taskId), "task:comment_reply_deleted", {
      taskId,
      parentCommentId,
      replyId,
      reply,
    });
  }

  emitTaskScheduleUpdated(taskId: string, task: TaskResponseDto) {
    this.emitToRoom(taskRoom(taskId), "task:schedule_updated", { taskId, task });
  }

  emitTaskRescheduled(taskId: string, task: TaskResponseDto) {
    this.emitToRoom(taskRoom(taskId), "task:rescheduled", { taskId, task });
  }

  emitTaskUnlocked(taskId: string, task: TaskResponseDto) {
    this.emitToRoom(taskRoom(taskId), "task:unlocked", { taskId, task });
  }

  emitTaskDueSoon(taskId: string, payload: TaskDueSoonPayload) {
    this.emitToRoom(taskRoom(taskId), "task:due_soon", payload);
  }

  emitTaskOverdueLocked(taskId: string, payload: TaskOverdueLockedPayload) {
    this.emitToRoom(taskRoom(taskId), "task:overdue_locked", payload);
  }

  emitTaskTagsUpdated(args: {
    boardId: string;
    taskId: string;
    task: TaskResponseDto;
    actorId?: string | null;
  }): void {
    const payload: TaskTagsUpdatedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: { boardId: args.boardId, taskId: args.taskId, task: args.task },
    });
    if (!this.io) return;
    try {
      this.io
        .to(taskRoom(args.taskId))
        .to(boardRoom(args.boardId))
        .emit("task:tags_updated", payload);
    } catch (error) {
      console.error("[realtime] task tag event publish failed", {
        taskId: args.taskId,
        boardId: args.boardId,
        eventId: payload.eventId,
        error,
      });
    }
  }

  emitTaskAssignmentsUpdated(args: {
    boardId: string;
    taskId: string;
    task: TaskResponseDto;
    actorId?: string | null;
  }): void {
    const payload: TaskAssignmentsUpdatedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: { boardId: args.boardId, taskId: args.taskId, task: args.task },
    });
    if (!this.io) return;
    try {
      this.io
        .to(taskRoom(args.taskId))
        .to(boardRoom(args.boardId))
        .emit("task:assignments_updated", payload);
    } catch (error) {
      console.error("[realtime] task assignments event publish failed", {
        taskId: args.taskId,
        boardId: args.boardId,
        eventId: payload.eventId,
        error,
      });
    }
  }

  private emitBoardTagEvent(
    event: "board:tag_created" | "board:tag_updated" | "board:tag_deleted",
    boardId: string,
    tag: TagResponseDto,
    actorId?: string | null,
  ): void {
    const payload: BoardTagPayload = createRealtimeEnvelope({
      actorId,
      data: { boardId, tag },
    });
    try {
      this.emitToRoom(boardRoom(boardId), event, payload);
    } catch (error) {
      console.error("[realtime] board tag event publish failed", {
        boardId,
        tagId: tag.id,
        eventId: payload.eventId,
        error,
      });
    }
  }

  emitBoardTagCreated(boardId: string, tag: TagResponseDto, actorId?: string | null): void {
    this.emitBoardTagEvent("board:tag_created", boardId, tag, actorId);
  }

  emitBoardTagUpdated(boardId: string, tag: TagResponseDto, actorId?: string | null): void {
    this.emitBoardTagEvent("board:tag_updated", boardId, tag, actorId);
  }

  emitBoardTagDeleted(boardId: string, tag: TagResponseDto, actorId?: string | null): void {
    this.emitBoardTagEvent("board:tag_deleted", boardId, tag, actorId);
  }

  emitUserNotification(userId: string, notification: UserNotificationPayload) {
    this.emitToUser(userId, "notification:new", notification);
  }
}

export const realtimeEventService = new RealtimeEventService();
