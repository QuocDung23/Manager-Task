import z from "zod";

export class CommentUserLite {
  id: string;
  name: string;
  avatar: string | null;

  constructor(data: { id: string; name: string; avatar: string | null }) {
    this.id = data.id;
    this.name = data.name;
    this.avatar = data.avatar;
  }
}

export class CommentResponseDto {
  id: string;
  taskId: string;
  userId: string;
  parentCommentId: string | null;
  content: string;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user?: CommentUserLite;
  replies?: CommentResponseDto[];

  constructor(data: CommentResponseDto) {
    this.id = data.id;
    this.taskId = data.taskId;
    this.userId = data.userId;
    this.parentCommentId = data.parentCommentId;
    this.content = data.content;
    this.replyCount = data.replyCount ?? 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    if (data.user) {
      this.user = new CommentUserLite(data.user);
    }
    if (data.replies) {
      this.replies = data.replies.map((r) => new CommentResponseDto(r));
    }
  }
}

const commentUserLiteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable(),
});

const commentBaseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  parentCommentId: z.string().uuid().nullable(),
  content: z.string(),
  replyCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  user: commentUserLiteSchema.optional(),
  replies: z.array(z.any()).optional(),
});

export const commentResponseSchema: z.ZodTypeAny = commentBaseSchema.extend({
  replies: z
    .array(z.lazy(() => commentBaseSchema))
    .optional(),
});
