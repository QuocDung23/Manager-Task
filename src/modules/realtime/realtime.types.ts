import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";
import { ListResponseDto } from "@/modules/lists/dtos/responses/list.res";
import { TaskResponseDto } from "@/modules/tasks/dtos/response";
import { TaskLockStatus, TaskStatusAction } from "@prisma/client";
import type { BoardResponseDto } from "@/modules/board/dtos/responses/board.res";
import type { BoardMemberResponseDto } from "@/modules/board/dtos/responses/boardMember.res";

export type RealtimeAck = {
  success: boolean;
  code?: "INVALID_ID" | "NOT_FOUND" | "FORBIDDEN" | "INTERNAL_ERROR";
  error?: string;
};

export type RealtimeEnvelope<T> = {
  eventId: string;
  occurredAt: Date;
  actorId: string | null;
  data: T;
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
  "board:join": (
    payload: { boardId: string },
    ack?: (res: RealtimeAck) => void,
  ) => void;
  "board:leave": (
    payload: { boardId: string },
    ack?: (res: RealtimeAck) => void,
  ) => void;
  "project:join": (
    payload: { projectId: string },
    ack?: (res: RealtimeAck) => void,
  ) => void;
  "project:leave": (
    payload: { projectId: string },
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

export type TaskTagsUpdatedPayload = RealtimeEnvelope<{
  boardId: string;
  taskId: string;
  task: TaskResponseDto;
}>;

export type TaskAssignmentsUpdatedPayload = RealtimeEnvelope<{
  boardId: string;
  taskId: string;
  task: TaskResponseDto;
}>;

export type TaskStatusActionUpdatedPayload = RealtimeEnvelope<{
  boardId: string;
  taskId: string;
  task: TaskResponseDto;
  statusAction: TaskStatusAction;
}>;

export type TaskCreatedPayload = RealtimeEnvelope<{
  boardId: string;
  listId: string;
  task: TaskResponseDto;
}>;

export type ListCreatedPayload = RealtimeEnvelope<{
  boardId: string;
  list: ListResponseDto;
}>;

export type BoardListsReorderedPayload = RealtimeEnvelope<{
  boardId: string;
  orderVersion: number;
  lists: ListResponseDto[];
}>;

export type BoardTasksReorderedPayload = RealtimeEnvelope<{
  boardId: string;
  orderVersion: number;
  taskId: string;
  sourceListId: string;
  targetListId: string;
  movedTask: TaskResponseDto;
  sourceTasks: TaskResponseDto[];
  targetTasks: TaskResponseDto[];
}>;

export type BoardTagPayload = RealtimeEnvelope<{
  boardId: string;
  tag: import("@/modules/tasks/tag/dtos/response").TagResponseDto;
}>;

export type BoardCreatedPayload = RealtimeEnvelope<{
  projectId: string;
  board: BoardResponseDto;
}>;

export type BoardUpdatedPayload = RealtimeEnvelope<{
  projectId: string;
  boardId: string;
  board: BoardResponseDto;
}>;

export type BoardDeletedPayload = RealtimeEnvelope<{
  projectId: string;
  boardId: string;
  board: BoardResponseDto;
}>;

export type BoardMemberAddedPayload = RealtimeEnvelope<{
  projectId: string;
  boardId: string;
  member: BoardMemberResponseDto;
}>;

export type BoardMemberRemovedPayload = RealtimeEnvelope<{
  projectId: string;
  boardId: string;
  memberId: string;
  userId: string;
}>;

export type BoardMemberRoleUpdatedPayload = RealtimeEnvelope<{
  projectId: string;
  boardId: string;
  member: BoardMemberResponseDto;
}>;

export type ProjectCreatedPayload = RealtimeEnvelope<{
  project: import("@/modules/projects/dtos/response").ProjectResponseDto;
}>;

export type ProjectUpdatedPayload = RealtimeEnvelope<{
  project: import("@/modules/projects/dtos/response").ProjectResponseDto;
}>;

export type ProjectDeletedPayload = RealtimeEnvelope<{
  projectId: string;
  project: import("@/modules/projects/dtos/response").ProjectResponseDto;
}>;

export type ProjectMemberAddedPayload = RealtimeEnvelope<{
  projectId: string;
  member: import("@/modules/projects/dtos/response").ProjectMemberResponseDto;
}>;

export type ProjectMemberRemovedPayload = RealtimeEnvelope<{
  projectId: string;
  memberId: string;
  userId: string;
}>;

export type ProjectMemberRoleUpdatedPayload = RealtimeEnvelope<{
  projectId: string;
  member: import("@/modules/projects/dtos/response").ProjectMemberResponseDto;
}>;

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
  "task:comment_reply_updated": (
    payload: TaskCommentReplyUpdatedPayload,
  ) => void;
  "task:comment_deleted": (payload: TaskCommentDeletedPayload) => void;
  "task:comment_reply_deleted": (
    payload: TaskCommentReplyDeletedPayload,
  ) => void;
  "task:schedule_updated": (payload: TaskScheduleUpdatedPayload) => void;
  "task:due_soon": (payload: TaskDueSoonPayload) => void;
  "task:overdue_locked": (payload: TaskOverdueLockedPayload) => void;
  "task:rescheduled": (payload: TaskScheduleUpdatedPayload) => void;
  "task:unlocked": (payload: TaskScheduleUpdatedPayload) => void;
  "task:tags_updated": (payload: TaskTagsUpdatedPayload) => void;
  "task:assignments_updated": (payload: TaskAssignmentsUpdatedPayload) => void;
  "task:status_action_updated": (
    payload: TaskStatusActionUpdatedPayload,
  ) => void;
  "task:created": (payload: TaskCreatedPayload) => void;
  "list:created": (payload: ListCreatedPayload) => void;
  "board:lists_reordered": (payload: BoardListsReorderedPayload) => void;
  "board:tasks_reordered": (payload: BoardTasksReorderedPayload) => void;
  "board:tag_created": (payload: BoardTagPayload) => void;
  "board:tag_updated": (payload: BoardTagPayload) => void;
  "board:tag_deleted": (payload: BoardTagPayload) => void;
  "board:created": (payload: BoardCreatedPayload) => void;
  "board:updated": (payload: BoardUpdatedPayload) => void;
  "board:deleted": (payload: BoardDeletedPayload) => void;
  "board:member_added": (payload: BoardMemberAddedPayload) => void;
  "board:member_removed": (payload: BoardMemberRemovedPayload) => void;
  "board:member_role_updated": (payload: BoardMemberRoleUpdatedPayload) => void;
  "project:created": (payload: ProjectCreatedPayload) => void;
  "project:updated": (payload: ProjectUpdatedPayload) => void;
  "project:deleted": (payload: ProjectDeletedPayload) => void;
  "project:member_added": (payload: ProjectMemberAddedPayload) => void;
  "project:member_removed": (payload: ProjectMemberRemovedPayload) => void;
  "project:member_role_updated": (
    payload: ProjectMemberRoleUpdatedPayload,
  ) => void;
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
export const boardRoom = (boardId: string) => `board:${boardId}`;
export const projectRoom = (projectId: string) => `project:${projectId}`;
export const userRoom = (userId: string) => `user:${userId}`;
