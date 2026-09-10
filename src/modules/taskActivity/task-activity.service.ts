import { NotFoundException } from "@/common";
import { TaskRepository } from "@/modules/tasks/task.repository";
import { realtimeEventService } from "@/modules/realtime";
import { TaskActivityRepository } from "./task-activity.repository";
import type {
  CreateTaskActivityInput,
  TaskActivityResponse,
} from "./task-activity.types";

function toResponse(value: Awaited<ReturnType<TaskActivityRepository["create"]>>): TaskActivityResponse {
  return {
    id: value.id,
    taskId: value.taskId,
    type: value.type,
    actor: value.actor,
    metadata:
      value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata)
        ? (value.metadata as Record<string, unknown>)
        : {},
    createdAt: value.createdAt,
  };
}

export class TaskActivityService {
  constructor(
    private readonly repository = new TaskActivityRepository(),
    private readonly taskRepository = new TaskRepository(),
  ) {}

  async create(input: CreateTaskActivityInput): Promise<TaskActivityResponse> {
    const activity = toResponse(await this.repository.create(input));
    realtimeEventService.emitTaskActivityCreated(activity);
    return activity;
  }

  async list(taskId: string, cursor?: string, requestedLimit = 20) {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) throw new NotFoundException("Task not found");
    const limit = Math.min(50, Math.max(1, requestedLimit || 20));
    const rows = await this.repository.list(taskId, cursor, limit);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(toResponse);
    return {
      success: true as const,
      data: {
        items,
        nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      },
    };
  }
}

export const taskActivityService = new TaskActivityService();
