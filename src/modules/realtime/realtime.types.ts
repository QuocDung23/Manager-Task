import { CommentResponseDto } from "@/modules/tasks/comment/dtos/response";

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

export type ServerToClientEvents = {
  "task:comment_created": (payload: TaskCommentCreatedPayload) => void;
  "task:comment_replied": (payload: TaskCommentRepliedPayload) => void;
  "task:comment_updated": (payload: TaskCommentUpdatedPayload) => void;
  "task:comment_reply_updated": (payload: TaskCommentReplyUpdatedPayload) => void;
  "task:comment_deleted": (payload: TaskCommentDeletedPayload) => void;
  "task:comment_reply_deleted": (payload: TaskCommentReplyDeletedPayload) => void;
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
