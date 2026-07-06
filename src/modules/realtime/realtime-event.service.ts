import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";
import { taskRoom } from "./realtime.types";
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
}

export const realtimeEventService = new RealtimeEventService();
