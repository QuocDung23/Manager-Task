import z from "zod";
import { CommentResponseDto, commentResponseSchema } from "./comment.res";

export class DeleteCommentResponseDto {
  comment: CommentResponseDto;
  isReply: boolean;
  parentCommentId: string | null;
  deletedReplyIds: string[];

  constructor(data: DeleteCommentResponseDto) {
    this.comment = data.comment;
    this.isReply = data.isReply;
    this.parentCommentId = data.parentCommentId;
    this.deletedReplyIds = data.deletedReplyIds;
  }
}

export const deleteCommentResponseSchema = z.object({
  comment: commentResponseSchema,
  isReply: z.boolean(),
  parentCommentId: z.string().uuid().nullable(),
  deletedReplyIds: z.array(z.string().uuid()),
});
