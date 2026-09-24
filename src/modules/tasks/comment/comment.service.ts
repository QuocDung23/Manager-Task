import { BadRequest, Exception } from "@tsed/exceptions";
import {
  ForbiddenException,
  HttpResponseBodySuccessDto,
  NotFoundException,
} from "@/common";
import {
  CreateCommentReplyRequestDto,
  CreateCommentRequestDto,
  DeleteCommentRequestDto,
  GetCommentRepliesRequestDto,
  GetCommentsRequestDto,
  UpdateCommentRequestDto,
} from "./dtos/request";
import {
  CommentResponseDto,
  DeleteCommentResponseDto,
  GetCommentRepliesResponseDto,
  GetCommentsResponseDto,
} from "./dtos/response";
import { TaskRepository } from "../task.repository";
import { CommentWithUser, TaskCommentRepository } from "./comment.repository";
import { BoardRepository } from "@/modules/board/board.repository";
import { PermissionRepository } from "@/modules/permission/permission.repository";
import { TaskPermissions } from "@/common/enums/permissions";

type ResolvedTaskContext = {
  taskId: string;
  listId: string;
  boardId: string;
  projectId: string;
};

export class TaskCommentService {
  constructor(
    private readonly taskRepository = new TaskRepository(),
    private readonly taskCommentRepository = new TaskCommentRepository(),
    private readonly boardRepository = new BoardRepository(),
    private readonly permissionRepository = new PermissionRepository(),
  ) {}

  // ===== Helper ===============================================================

  /**
   * Map từ Prisma record (có include user) sang `CommentResponseDto`.
   * `replyCount` được truyền vào vì service tự tính để tránh thêm query.
   */
  private toCommentResponse(
    comment: CommentWithUser,
    replyCount: number = 0,
    replies?: CommentResponseDto[],
  ): CommentResponseDto {
    return new CommentResponseDto({
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      parentCommentId: comment.parentCommentId ?? null,
      content: comment.content,
      replyCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt ?? null,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatar: comment.user.avatar,
      },
      replies,
    });
  }

  /**
   * Resolve task -> list -> board -> project; throw nếu bất kỳ thực thể nào
   * không tồn tại hoặc đã soft delete.
   */
  private async getActiveTaskContextOrThrow(
    taskId: string,
  ): Promise<ResolvedTaskContext> {
    const taskWithList =
      await this.taskRepository.getTaskWithList(taskId);
    if (!taskWithList) {
      throw new NotFoundException("Task not found");
    }
    if (taskWithList.deletedAt !== null) {
      throw new NotFoundException("Task not found");
    }
    if (!taskWithList.list || taskWithList.list.deletedAt !== null) {
      throw new NotFoundException("List not found");
    }
    const board = await this.boardRepository.getBoardById({
      id: taskWithList.list.boardId,
    });
    if (!board || board.deletedAt !== null) {
      throw new NotFoundException("Board not found");
    }
    return {
      taskId: taskWithList.id,
      listId: taskWithList.listId,
      boardId: board.id,
      projectId: board.projectId,
    };
  }

  /**
   * Verify một comment root active thuộc về task; throw nếu không hợp lệ.
   */
  private async getActiveRootCommentOrThrow(
    taskId: string,
    commentId: string,
  ): Promise<CommentWithUser> {
    const comment = await this.taskCommentRepository.getActiveCommentById({
      commentId,
      taskId,
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    if (comment.parentCommentId !== null) {
      throw new BadRequest("Reply cannot be a parent of another comment");
    }
    return comment;
  }

  // ===== List comments =======================================================

  async getTaskComments(
    dto: GetCommentsRequestDto,
  ): Promise<HttpResponseBodySuccessDto<GetCommentsResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);

    const fetchedDesc =
      await this.taskCommentRepository.getRootCommentsByTaskId({
        taskId: ctx.taskId,
        cursor: dto.cursor,
        limit: dto.limit,
      });

    const fetched = [...fetchedDesc].reverse();

    let nextCursor: string | null = null;
    if (fetchedDesc.length === dto.limit) {
      nextCursor = fetchedDesc[fetchedDesc.length - 1].id;
    }

    const items: CommentResponseDto[] = [];
    for (const c of fetched) {
      if (dto.includeReplies) {
        const replyCount =
          await this.taskCommentRepository.countActiveReplies(c.id);
        const repliesDesc =
          await this.taskCommentRepository.getRepliesByCommentId({
            taskId: ctx.taskId,
            parentCommentId: c.id,
            limit: 50,
          });
        const replies = repliesDesc
          .reverse()
          .map((r) => this.toCommentResponse(r, 0));
        items.push(this.toCommentResponse(c, replyCount, replies));
      } else {
        const replyCount =
          await this.taskCommentRepository.countActiveReplies(c.id);
        items.push(this.toCommentResponse(c, replyCount));
      }
    }

    return {
      success: true,
      data: new GetCommentsResponseDto({ items, nextCursor }),
    };
  }

  async getTaskCommentReplies(
    dto: GetCommentRepliesRequestDto,
  ): Promise<
    | HttpResponseBodySuccessDto<GetCommentRepliesResponseDto>
    | Exception
  > {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    await this.getActiveRootCommentOrThrow(ctx.taskId, dto.commentId);

    const repliesDesc =
      await this.taskCommentRepository.getRepliesByCommentId({
        taskId: ctx.taskId,
        parentCommentId: dto.commentId,
        cursor: dto.cursor,
        limit: dto.limit,
      });

    let nextCursor: string | null = null;
    if (repliesDesc.length === dto.limit) {
      nextCursor = repliesDesc[repliesDesc.length - 1].id;
    }

    const replies = repliesDesc.reverse();
    const items = replies.map((r) => this.toCommentResponse(r, 0));

    return {
      success: true,
      data: new GetCommentRepliesResponseDto({ items, nextCursor }),
    };
  }

  // ===== Create ==============================================================

  async createTaskComment(
    dto: CreateCommentRequestDto,
  ): Promise<HttpResponseBodySuccessDto<CommentResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);

    const created = await this.taskCommentRepository.createComment({
      taskId: ctx.taskId,
      userId: dto.userId,
      content: dto.content,
    });

    return {
      success: true,
      data: this.toCommentResponse(created, 0),
    };
  }

  async createTaskCommentReply(
    dto: CreateCommentReplyRequestDto,
  ): Promise<HttpResponseBodySuccessDto<CommentResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    await this.getActiveRootCommentOrThrow(ctx.taskId, dto.parentCommentId);

    const created = await this.taskCommentRepository.createComment({
      taskId: ctx.taskId,
      userId: dto.userId,
      parentCommentId: dto.parentCommentId,
      content: dto.content,
    });

    return {
      success: true,
      data: this.toCommentResponse(created, 0),
    };
  }

  // ===== Update ==============================================================

  async updateTaskComment(
    dto: UpdateCommentRequestDto,
  ): Promise<HttpResponseBodySuccessDto<CommentResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    const comment = await this.taskCommentRepository.getActiveCommentById({
      commentId: dto.commentId,
      taskId: ctx.taskId,
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== dto.userId) {
      throw new ForbiddenException("Only the author can edit this comment");
    }

    const updated = await this.taskCommentRepository.updateComment({
      commentId: comment.id,
      content: dto.content,
    });

    let replyCount = 0;
    if (comment.parentCommentId === null) {
      replyCount = await this.taskCommentRepository.countActiveReplies(
        comment.id,
      );
    }

    return {
      success: true,
      data: this.toCommentResponse(updated, replyCount),
    };
  }

  // ===== Delete ==============================================================

  async deleteTaskComment(
    dto: DeleteCommentRequestDto,
  ): Promise<HttpResponseBodySuccessDto<DeleteCommentResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    const comment = await this.taskCommentRepository.getActiveCommentById({
      commentId: dto.commentId,
      taskId: ctx.taskId,
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    const actorUserId = dto.userId;
    if (!actorUserId) {
      throw new ForbiddenException("Missing actor");
    }

    const isAuthor = comment.userId === actorUserId;
    if (!isAuthor) {
      const hasAdminDelete = await this.permissionRepository.checkAnyPermission(
        actorUserId,
        [TaskPermissions.DELETE_TASK_COMMENT],
        { boardId: ctx.boardId, projectId: ctx.projectId },
      );
      if (!hasAdminDelete) {
        throw new ForbiddenException(
          "You can only delete your own comments or need DELETE_TASK_COMMENT",
        );
      }
    }

    if (comment.parentCommentId === null) {
      const { comment: deleted, deletedReplyIds } =
        await this.taskCommentRepository.softDeleteCommentWithReplies(
          comment.id,
        );
      return {
        success: true,
        data: new DeleteCommentResponseDto({
          comment: this.toCommentResponse(deleted, 0),
          isReply: false,
          parentCommentId: null,
          deletedReplyIds,
        }),
      };
    }

    const deleted = await this.taskCommentRepository.softDeleteComment(
      comment.id,
    );
    return {
      success: true,
      data: new DeleteCommentResponseDto({
        comment: this.toCommentResponse(deleted, 0),
        isReply: true,
        parentCommentId: comment.parentCommentId,
        deletedReplyIds: [],
      }),
    };
  }
}
