import z from "zod";
import { CommentResponseDto, commentResponseSchema } from "./comment.res";

export class GetCommentsResponseDto {
  items: CommentResponseDto[];
  nextCursor: string | null;

  constructor(data: GetCommentsResponseDto) {
    this.items = data.items;
    this.nextCursor = data.nextCursor;
  }
}

export const getCommentsResponseSchema = z.object({
  items: z.array(commentResponseSchema),
  nextCursor: z.string().uuid().nullable(),
});

export class GetCommentRepliesResponseDto {
  items: CommentResponseDto[];
  nextCursor: string | null;

  constructor(data: GetCommentRepliesResponseDto) {
    this.items = data.items;
    this.nextCursor = data.nextCursor;
  }
}

export const getCommentRepliesResponseSchema = z.object({
  items: z.array(commentResponseSchema),
  nextCursor: z.string().uuid().nullable(),
});
