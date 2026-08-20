import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";
import { ListResponseDto } from "@/modules/lists/dtos/responses/list.res";
import { TaskResponseDto } from "@/modules/tasks/dtos/response";
import {
  boardRoom,
  BoardListsReorderedPayload,
  BoardTagPayload,
  BoardTasksReorderedPayload,
  taskRoom,
  TaskTagsUpdatedPayload,
  TaskDueSoonPayload,
  TaskOverdueLockedPayload,
  UserNotificationPayload,
  userRoom,
  TaskAssignmentsUpdatedPayload,
  TaskStatusActionUpdatedPayload,
  TaskCreatedPayload,
  ListCreatedPayload,
} from "./realtime.types";
import type { AppSocketServer } from "./socket.server";
import { createRealtimeEnvelope } from "./realtime-envelope";
import { TagResponseDto } from "@/modules/tasks/tag/dtos/response";

/**
 * Server-side per-board monotonic counter for reorder mutations.
 *
 * Phase 1 của plan: chưa thêm cột `orderVersion` vào schema, nên dùng
 * counter in-memory theo process. Khi scale BE chạy nhiều instance,
 * counter sẽ không đồng bộ giữa các node; vẫn đảm bảo "eventId" là
 * dedupe key chính, còn `orderVersion` chỉ là best-effort local revision.
 * Khi reconnect, FE refetch toàn bộ board list/task nên sẽ tự hồi phục.
 */
const boardOrderRevision = new Map<string, number>();
function nextBoardRevision(boardId: string): number {
  const next = (boardOrderRevision.get(boardId) ?? 0) + 1;
  boardOrderRevision.set(boardId, next);
  return next;
}

/**
 * Service emit realtime event tới 
  emitTaskCreated(arg0: { boardId: string; listId: string; task: TaskResponseDto; actorId: string | undefined; }) {
    throw new Error("Method not implemented.");
  }các client đang subscribe.
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

  emitTaskStatusActionUpdated(args: {
    boardId: string;
    taskId: string;
    task: TaskResponseDto;
    statusAction: TaskResponseDto["statusAction"];
    actorId?: string | null;
  }): void {
    const payload: TaskStatusActionUpdatedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: {
        boardId: args.boardId,
        taskId: args.taskId,
        task: args.task,
        statusAction: args.statusAction,
      },
    });
    if (!this.io) return;
    try {
      this.io
        .to(taskRoom(args.taskId))
        .to(boardRoom(args.boardId))
        .emit("task:status_action_updated", payload);
    } catch (error) {
      console.error("[realtime] task status action event publish failed", {
        taskId: args.taskId,
        boardId: args.boardId,
        statusAction: args.statusAction,
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

  emitTaskCreated(args: {
    boardId: string;
    listId: string;
    task: TaskResponseDto;
    actorId?: string | null;
  }): void {
    const payload: TaskCreatedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: { boardId: args.boardId, listId: args.listId, task: args.task },
    });
    if (!this.io) return;
    try {
      this.io.to(boardRoom(args.boardId)).emit("task:created", payload);
    } catch (error) {
      console.error("[realtime] task:created event publish failed", {
        taskId: args.task.id,
        boardId: args.boardId,
        listId: args.listId,
        eventId: payload.eventId,
        error,
      });
    }
  }

  emitListCreated(args: {
    boardId: string;
    list: ListResponseDto;
    actorId?: string | null;
  }): void {
    const payload: ListCreatedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: { boardId: args.boardId, list: args.list },
    });
    if (!this.io) return;
    try {
      this.io.to(boardRoom(args.boardId)).emit("list:created", payload);
    } catch (error) {
      console.error("[realtime] list:created event publish failed", {
        listId: args.list.id,
        boardId: args.boardId,
        eventId: payload.eventId,
        error,
      });
    }
  }

  emitBoardListsReordered(args: {
    boardId: string;
    lists: ListResponseDto[];
    actorId?: string | null;
  }): void {
    const payload: BoardListsReorderedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: {
        boardId: args.boardId,
        orderVersion: nextBoardRevision(args.boardId),
        lists: args.lists,
      },
    });
    if (!this.io) return;
    try {
      this.io.to(boardRoom(args.boardId)).emit("board:lists_reordered", payload);
    } catch (error) {
      console.error("[realtime] board:lists_reordered event publish failed", {
        boardId: args.boardId,
        eventId: payload.eventId,
        error,
      });
    }
  }

  emitBoardTasksReordered(args: {
    boardId: string;
    taskId: string;
    sourceListId: string;
    targetListId: string;
    movedTask: TaskResponseDto;
    sourceTasks: TaskResponseDto[];
    targetTasks: TaskResponseDto[];
    actorId?: string | null;
  }): void {
    const payload: BoardTasksReorderedPayload = createRealtimeEnvelope({
      actorId: args.actorId,
      data: {
        boardId: args.boardId,
        orderVersion: nextBoardRevision(args.boardId),
        taskId: args.taskId,
        sourceListId: args.sourceListId,
        targetListId: args.targetListId,
        movedTask: args.movedTask,
        sourceTasks: args.sourceTasks,
        targetTasks: args.targetTasks,
      },
    });
    if (!this.io) return;
    try {
      this.io
        .to(boardRoom(args.boardId))
        .to(taskRoom(args.taskId))
        .emit("board:tasks_reordered", payload);
    } catch (error) {
      console.error("[realtime] board:tasks_reordered event publish failed", {
        boardId: args.boardId,
        taskId: args.taskId,
        eventId: payload.eventId,
        error,
      });
    }
  }
}

export const realtimeEventService = new RealtimeEventService();
