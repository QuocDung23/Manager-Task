import { HttpResponseDto } from "@/common";
import { Exception } from "@tsed/exceptions";
import { Request, Response } from "express";
import {
  AttachTaskTagRequestDto,
  CreateTagRequestDto,
  DeleteTagRequestDto,
  DetachTaskTagRequestDto,
  GetTagsRequestDto,
  GetTasksByTagRequestDto,
  ReplaceTaskTagsRequestDto,
  UpdateTagRequestDto,
} from "./dtos/request";
import { TaskTagService } from "./tag.service";

export class TaskTagController {
  constructor(private readonly taskTagService = new TaskTagService()) {}

  private getActorUserId(req: Request): string | undefined {
    const user = (req as Request & { user?: { id?: unknown } }).user;
    return typeof user?.id === "string" ? user.id : undefined;
  }

  async getTags(req: Request, res: Response): Promise<Response> {
    const dto = new GetTagsRequestDto({
      ...(req.query as Record<string, unknown>),
      boardId: req.params.boardId,
    } as GetTagsRequestDto);

    const result = await this.taskTagService.getTags(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async createTag(req: Request, res: Response): Promise<Response> {
    const dto = new CreateTagRequestDto({
      ...(req.body as Record<string, unknown>),
      boardId: req.params.boardId,
    } as CreateTagRequestDto);

    const result = await this.taskTagService.createTag(dto, this.getActorUserId(req));
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().created(res, result);
  }

  async updateTag(req: Request, res: Response): Promise<Response> {
    const dto = new UpdateTagRequestDto({
      ...(req.body as Record<string, unknown>),
      boardId: req.params.boardId,
      tagId: req.params.tagId,
    } as UpdateTagRequestDto);

    const result = await this.taskTagService.updateTag(dto, this.getActorUserId(req));
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async deleteTag(req: Request, res: Response): Promise<Response> {
    const dto = new DeleteTagRequestDto({
      boardId: req.params.boardId,
      tagId: req.params.tagId,
    } as DeleteTagRequestDto);

    const result = await this.taskTagService.deleteTag(dto, this.getActorUserId(req));
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async replaceTaskTags(req: Request, res: Response): Promise<Response> {
    const dto = new ReplaceTaskTagsRequestDto({
      ...(req.body as Record<string, unknown>),
      taskId: req.params.taskId,
    } as ReplaceTaskTagsRequestDto);

    const result = await this.taskTagService.replaceTaskTags(dto, this.getActorUserId(req));
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async attachTaskTag(req: Request, res: Response): Promise<Response> {
    const dto = new AttachTaskTagRequestDto({
      taskId: req.params.taskId,
      tagId: req.params.tagId,
    } as AttachTaskTagRequestDto);

    const result = await this.taskTagService.attachTaskTag(dto, this.getActorUserId(req));
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async detachTaskTag(req: Request, res: Response): Promise<Response> {
    const dto = new DetachTaskTagRequestDto({
      taskId: req.params.taskId,
      tagId: req.params.tagId,
    } as DetachTaskTagRequestDto);

    const result = await this.taskTagService.detachTaskTag(dto, this.getActorUserId(req));
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async getTasksByTag(req: Request, res: Response): Promise<Response> {
    const dto = new GetTasksByTagRequestDto({
      ...(req.query as Record<string, unknown>),
      boardId: req.params.boardId,
      tagId: req.params.tagId,
    } as GetTasksByTagRequestDto);

    const result = await this.taskTagService.getTasksByTag(dto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }
}
