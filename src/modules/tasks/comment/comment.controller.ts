import { Exception } from "@tsed/exceptions";
import { Request, Response } from "express";
import {
  CreateCommentReplyRequestDto,
  CreateCommentRequestDto,
  DeleteCommentRequestDto,
  GetCommentRepliesRequestDto,
  GetCommentsRequestDto,
  UpdateCommentRequestDto,
} from "./dtos/request";
import { TaskCommentService } from "./comment.service";
import { HttpResponseDto, UnauthorizedException } from "@/common";
import { realtimeEventService } from "@/modules/realtime";

export class TaskCommentController {
  constructor(
    private readonly taskCommentService = new TaskCommentService(),
  ) {}

  private getActorUserIdOrThrow(req: Request): string {
    const actor = (req as any).user;
    const actorUserId: string | undefined = actor?.id;
    if (!actorUserId) {
      throw new UnauthorizedException();
    }
    return actorUserId;
  }

  async getTaskComments(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const dto = new GetCommentsRequestDto({
      taskId,
      cursor: (req.query as any)?.cursor,
      limit: Number((req.query as any)?.limit ?? 20),
      includeReplies:
        (req.query as any)?.includeReplies === true ||
        (req.query as any)?.includeReplies === "true",
    });
    const result = await this.taskCommentService.getTaskComments(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async createTaskComment(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const actorUserId = this.getActorUserIdOrThrow(req);
    const dto = new CreateCommentRequestDto({
      taskId,
      content: (req.body as any)?.content,
      userId: actorUserId,
    });
    const result = await this.taskCommentService.createTaskComment(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    realtimeEventService.emitTaskCommentCreated(taskId, result.data);
    return new HttpResponseDto().created(res, result);
  }

  async createTaskCommentReply(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const commentId = req.params.commentId as string;
    const actorUserId = this.getActorUserIdOrThrow(req);
    const dto = new CreateCommentReplyRequestDto({
      taskId,
      parentCommentId: commentId,
      content: (req.body as any)?.content,
      userId: actorUserId,
    });
    const result = await this.taskCommentService.createTaskCommentReply(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    realtimeEventService.emitTaskCommentReplied(
      taskId,
      commentId,
      result.data,
    );
    return new HttpResponseDto().created(res, result);
  }

  async getTaskCommentReplies(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const commentId = req.params.commentId as string;
    const dto = new GetCommentRepliesRequestDto({
      taskId,
      commentId,
      cursor: (req.query as any)?.cursor,
      limit: Number((req.query as any)?.limit ?? 20),
    });
    const result = await this.taskCommentService.getTaskCommentReplies(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async updateTaskComment(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const commentId = req.params.commentId as string;
    const actorUserId = this.getActorUserIdOrThrow(req);
    const dto = new UpdateCommentRequestDto({
      taskId,
      commentId,
      content: (req.body as any)?.content,
      userId: actorUserId,
    });
    const result = await this.taskCommentService.updateTaskComment(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    if (result.data.parentCommentId) {
      realtimeEventService.emitTaskCommentReplyUpdated(
        taskId,
        result.data.parentCommentId,
        result.data,
      );
    } else {
      realtimeEventService.emitTaskCommentUpdated(taskId, result.data);
    }
    return new HttpResponseDto().success(res, result);
  }

  async deleteTaskComment(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const commentId = req.params.commentId as string;
    const actorUserId = this.getActorUserIdOrThrow(req);
    const dto = new DeleteCommentRequestDto({
      taskId,
      commentId,
      userId: actorUserId,
    });
    const result = await this.taskCommentService.deleteTaskComment(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }

    const data = result.data;
    if (data.isReply) {
      realtimeEventService.emitTaskCommentReplyDeleted(
        taskId,
        data.parentCommentId ?? "",
        data.comment.id,
        data.comment,
      );
    } else {
      realtimeEventService.emitTaskCommentDeleted(
        taskId,
        data.comment.id,
        data.comment,
        data.deletedReplyIds,
      );
    }
    return new HttpResponseDto().success(res, result);
  }
}