import { BadRequest, Exception } from "@tsed/exceptions";
import {
  ForbiddenException,
  HttpResponseBodySuccessDto,
  NotFoundException,
} from "@/common";
import { BoardRepository } from "@/modules/board/board.repository";
import { ListRepository } from "@/modules/lists/list.repository";
import {
  TaskRepository,
  TaskWithDetails,
} from "@/modules/tasks/task.repository";
import { Prisma, TaskLockStatus } from "@prisma/client";
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
import {
  GetTasksByTagResponseDto,
  TagResponseDto,
  TaskTagSummaryDto,
} from "./dtos/response";
import { TaskResponseDto } from "../dtos/response";
import { TaskTagRepository } from "./tag.repository";
import { realtimeEventService } from "@/modules/realtime/realtime-event.service";

const DEFAULT_TAG_COLOR = "#64748b";

type ResolvedTaskContext = {
  taskId: string;
  listId: string;
  boardId: string;
  lockStatus: TaskLockStatus;
};

export class TaskTagService {
  constructor(
    private readonly taskRepository = new TaskRepository(),
    private readonly tagRepository = new TaskTagRepository(),
    private readonly boardRepository = new BoardRepository(),
    private readonly listRepository = new ListRepository(),
  ) {}

  private normalizeTagName(name: string): string {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
  }

  private displayTagName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  private toTaskResponse(task: TaskWithDetails): TaskResponseDto {
    return new TaskResponseDto(task as unknown as TaskResponseDto);
  }

  private assertTaskNotLocked(ctx: ResolvedTaskContext, action: string): void {
    if (ctx.lockStatus === TaskLockStatus.OVERDUE_LOCKED) {
      throw new ForbiddenException(
        `Task is locked because it is overdue. Please reschedule before ${action}.`,
      );
    }
  }

  private async getActiveBoardOrThrow(boardId: string): Promise<void> {
    const board = await this.boardRepository.getBoardById({ id: boardId });
    if (!board) {
      throw new NotFoundException("Board not found");
    }
  }

  private async getActiveTaskContextOrThrow(
    taskId: string,
  ): Promise<ResolvedTaskContext> {
    const task = await this.taskRepository.getTaskWithList(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    if (!task.list || task.list.deletedAt !== null) {
      throw new NotFoundException("List not found");
    }

    return {
      taskId: task.id,
      listId: task.listId,
      boardId: task.list.boardId,
      lockStatus: task.lockStatus,
    };
  }

  private async getActiveTagInBoardOrThrow(args: {
    boardId: string;
    tagId: string;
  }) {
    const tag = await this.tagRepository.getTagByIdInBoard({
      boardId: args.boardId,
      tagId: args.tagId,
    });
    if (!tag) {
      throw new NotFoundException("Tag not found");
    }
    return tag;
  }

  private async assertAllTagsBelongToBoard(args: {
    boardId: string;
    tagIds: string[];
  }): Promise<void> {
    const tags = await this.tagRepository.getActiveTagsByIdsInBoard(args);
    if (tags.length !== args.tagIds.length) {
      throw new BadRequest("Some tags are invalid for this board");
    }
  }

  async getTags(
    dto: GetTagsRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TagResponseDto[]> | Exception> {
    await this.getActiveBoardOrThrow(dto.boardId);

    const tags = await this.tagRepository.getTagsByBoardId({
      boardId: dto.boardId,
      name: dto.name,
      includeDeleted: dto.includeDeleted,
    });

    return {
      success: true,
      data: tags.map((tag) => new TagResponseDto(tag)),
    };
  }

  async createTag(
    dto: CreateTagRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TagResponseDto> | Exception> {
    await this.getActiveBoardOrThrow(dto.boardId);

    const name = this.displayTagName(dto.name);
    const nameNormalized = this.normalizeTagName(name);
    const color = dto.color ?? DEFAULT_TAG_COLOR;

    const existing = await this.tagRepository.findTagByNormalizedName({
      boardId: dto.boardId,
      nameNormalized,
    });

    if (existing && existing.deletedAt === null) {
      throw new BadRequest("Tag name already exists");
    }

    const tag = existing
      ? await this.tagRepository.reviveTag({
          tagId: existing.id,
          name,
          nameNormalized,
          color,
        })
      : await this.tagRepository.createTag({
          board: { connect: { id: dto.boardId } },
          name,
          nameNormalized,
          color,
        });

    const response = new TagResponseDto(tag);
    realtimeEventService.emitBoardTagCreated(dto.boardId, response, actorUserId);
    return {
      success: true,
      data: response,
    };
  }

  async updateTag(
    dto: UpdateTagRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TagResponseDto> | Exception> {
    const current = await this.getActiveTagInBoardOrThrow({
      boardId: dto.boardId,
      tagId: dto.tagId,
    });

    const updateData: Prisma.tagsUpdateInput = {};

    if (dto.name !== undefined) {
      const name = this.displayTagName(dto.name);
      const nameNormalized = this.normalizeTagName(name);
      const duplicate = await this.tagRepository.findTagByNormalizedName({
        boardId: dto.boardId,
        nameNormalized,
      });

      if (duplicate && duplicate.id !== current.id) {
        throw new BadRequest("Tag name already exists");
      }

      updateData.name = name;
      updateData.nameNormalized = nameNormalized;
    }

    if (dto.color !== undefined) {
      updateData.color = dto.color;
    }

    const updated = await this.tagRepository.updateTag({
      tagId: current.id,
      data: updateData,
    });

    const response = new TagResponseDto(updated);
    realtimeEventService.emitBoardTagUpdated(dto.boardId, response, actorUserId);
    return {
      success: true,
      data: response,
    };
  }

  async deleteTag(
    dto: DeleteTagRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TagResponseDto> | Exception> {
    const tag = await this.getActiveTagInBoardOrThrow({
      boardId: dto.boardId,
      tagId: dto.tagId,
    });

    const deleted = await this.tagRepository.softDeleteTagWithTaskTags(tag.id);

    const response = new TagResponseDto(deleted);
    realtimeEventService.emitBoardTagDeleted(dto.boardId, response, actorUserId);
    return {
      success: true,
      data: response,
    };
  }

  async replaceTaskTags(
    dto: ReplaceTaskTagsRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const uniqueTagIds = Array.from(new Set(dto.tagIds));
    if (uniqueTagIds.length !== dto.tagIds.length) {
      throw new BadRequest("tagIds contains duplicates");
    }

    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    this.assertTaskNotLocked(ctx, "changing task tags");
    if (uniqueTagIds.length > 0) {
      await this.assertAllTagsBelongToBoard({
        boardId: ctx.boardId,
        tagIds: uniqueTagIds,
      });
    }

    const updated = await this.tagRepository.replaceTaskTags({
      taskId: ctx.taskId,
      tagIds: uniqueTagIds,
    });
    if (!updated) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updated);
    realtimeEventService.emitTaskTagsUpdated({
      boardId: ctx.boardId,
      taskId: ctx.taskId,
      task: response,
      actorId: actorUserId,
    });
    return {
      success: true,
      data: response,
    };
  }

  async attachTaskTag(
    dto: AttachTaskTagRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    this.assertTaskNotLocked(ctx, "changing task tags");
    await this.getActiveTagInBoardOrThrow({
      boardId: ctx.boardId,
      tagId: dto.tagId,
    });

    const updated = await this.tagRepository.attachTaskTag({
      taskId: ctx.taskId,
      tagId: dto.tagId,
    });
    if (!updated) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updated);
    realtimeEventService.emitTaskTagsUpdated({
      boardId: ctx.boardId,
      taskId: ctx.taskId,
      task: response,
      actorId: actorUserId,
    });
    return {
      success: true,
      data: response,
    };
  }

  async detachTaskTag(
    dto: DetachTaskTagRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const ctx = await this.getActiveTaskContextOrThrow(dto.taskId);
    this.assertTaskNotLocked(ctx, "changing task tags");
    await this.getActiveTagInBoardOrThrow({
      boardId: ctx.boardId,
      tagId: dto.tagId,
    });

    const existing = await this.tagRepository.getActiveTaskTag({
      taskId: ctx.taskId,
      tagId: dto.tagId,
    });
    if (!existing || existing.deletedAt !== null) {
      throw new NotFoundException("Task tag not found");
    }

    const updated = await this.tagRepository.detachTaskTag({
      taskId: ctx.taskId,
      tagId: dto.tagId,
    });
    if (!updated) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updated);
    realtimeEventService.emitTaskTagsUpdated({
      boardId: ctx.boardId,
      taskId: ctx.taskId,
      task: response,
      actorId: actorUserId,
    });
    return {
      success: true,
      data: response,
    };
  }

  async getTasksByTag(
    dto: GetTasksByTagRequestDto,
  ): Promise<HttpResponseBodySuccessDto<GetTasksByTagResponseDto> | Exception> {
    await this.getActiveBoardOrThrow(dto.boardId);
    const tag = await this.getActiveTagInBoardOrThrow({
      boardId: dto.boardId,
      tagId: dto.tagId,
    });

    if (dto.listId) {
      const list = await this.listRepository.getListById(dto.listId);
      if (!list || list.boardId !== dto.boardId) {
        throw new NotFoundException("List not found");
      }
    }

    const tasks = await this.tagRepository.getTasksByTagInBoard({
      boardId: dto.boardId,
      tagId: dto.tagId,
      listId: dto.listId,
      name: dto.name,
      status: dto.status,
    });

    return {
      success: true,
      data: new GetTasksByTagResponseDto({
        tag: new TaskTagSummaryDto(tag),
        tasks: tasks.map((task) => this.toTaskResponse(task)),
      }),
    };
  }
}
