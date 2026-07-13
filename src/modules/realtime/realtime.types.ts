import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";
import { TaskResponseDto } from "@/modules/tasks/dtos/response";
import { TaskLockStatus } from "@prisma/client";

export type RealtimeAck = {
  success: boolean;
  error?: string;
};

export type ClientToServerEvents = {
  "task:join": (
    payload: { taskId: string },
    ack?: (res: RealtimeAck) => void,
  ) => void;
  "task:leave": (
    payload: { taskId: string },
    ack?: (res: RealtimeAck) => void,
  ) => void;
};

export type TaskCommentCreatedPayload = {
  taskId: string;
  comment: CommentResponseDto;
};

export type TaskCommentRepliedPayload = {
  taskId: string;
  parentCommentId: string;
  reply: CommentResponseDto;
};

export type TaskCommentUpdatedPayload = {
  taskId: string;
  comment: CommentResponseDto;
};

export type TaskCommentReplyUpdatedPayload = {
  taskId: string;
  parentCommentId: string;
  reply: CommentResponseDto;
};

export type TaskCommentDeletedPayload = {
  taskId: string;
  commentId: string;
  comment: CommentResponseDto;
  deletedReplyIds?: string[];
};

export type TaskCommentReplyDeletedPayload = {
  taskId: string;
  parentCommentId: string;
  replyId: string;
  reply: CommentResponseDto;
};

export type TaskScheduleUpdatedPayload = {
  taskId: string;
  task: TaskResponseDto;
};

export type TaskDueSoonPayload = {
  taskId: string;
  dueDate: Date;
  reminderAt: Date | null;
};

export type TaskOverdueLockedPayload = {
  taskId: string;
  dueDate: Date;
  lockedAt: Date;
  lockStatus: TaskLockStatus;
};

export type UserNotificationPayload = {
  type:
    | "TASK_DUE_SOON"
    | "TASK_OVERDUE_LOCKED"
    | "TASK_RESCHEDULED"
    | "TASK_SCHEDULE_UPDATED"
    | "TASK_UNLOCKED";
  title: string;
  body: string;
  data: Record<string, unknown>;
  createdAt: Date;
};

export type ServerToClientEvents = {
  "task:comment_created": (payload: TaskCommentCreatedPayload) => void;
  "task:comment_replied": (payload: TaskCommentRepliedPayload) => void;
  "task:comment_updated": (payload: TaskCommentUpdatedPayload) => void;
  "task:comment_reply_updated": (payload: TaskCommentReplyUpdatedPayload) => void;
  "task:comment_deleted": (payload: TaskCommentDeletedPayload) => void;
  "task:comment_reply_deleted": (payload: TaskCommentReplyDeletedPayload) => void;
  "task:schedule_updated": (payload: TaskScheduleUpdatedPayload) => void;
  "task:due_soon": (payload: TaskDueSoonPayload) => void;
  "task:overdue_locked": (payload: TaskOverdueLockedPayload) => void;
  "task:rescheduled": (payload: TaskScheduleUpdatedPayload) => void;
  "task:unlocked": (payload: TaskScheduleUpdatedPayload) => void;
  "notification:new": (payload: UserNotificationPayload) => void;
};

export type InterServerEvents = Record<string, never>;

export type SocketData = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
};

export const taskRoom = (taskId: string) => `task:${taskId}`;
export const userRoom = (userId: string) => `user:${userId}`;
