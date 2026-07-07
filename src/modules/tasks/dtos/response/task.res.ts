import { TaskStatus, TaskStatusAction } from "@prisma/client";
import z from "zod";
import {
  TaskTagSummaryDto,
  taskTagSummarySchema,
} from "@/modules/tasks/tag/dtos/response/taskTagSummary.res";

type TaskAssignmentLite = {
  id: string;
  taskId: string;
  userId: string;
  assignedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type TaskTagLite = {
  id: string;
  taskId: string;
  tagId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  tag: {
    id: string;
    name: string;
    color: string;
    deletedAt?: Date | null;
  };
};

export class TaskResponseDto {
  id: string;
  name: string;
  description?: string;
  orderTask: number;
  dueDate?: Date;
  listId: string;
  assign: string[];
  tags: TaskTagSummaryDto[];
  status: TaskStatus;
  statusAction: TaskStatusAction;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    data:
      | TaskResponseDto
      | (TaskResponseDto & { taskAssignments?: TaskAssignmentLite[] }),
  ) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.orderTask = data.orderTask;
    this.dueDate = data.dueDate;
    this.listId = data.listId;
    this.status = data.status;
    this.statusAction = data.statusAction;

    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;

    const fromData = (data as TaskResponseDto).assign;
    if (Array.isArray(fromData) && fromData.length > 0) {
      this.assign = fromData;
    } else {
      const assignments = (data as { taskAssignments?: TaskAssignmentLite[] })
        .taskAssignments;
      this.assign = Array.isArray(assignments)
        ? assignments.map((a) => a.userId)
        : [];
    }

    const fromTags = (data as TaskResponseDto).tags;
    if (Array.isArray(fromTags) && fromTags.length > 0) {
      this.tags = fromTags.map((tag) => new TaskTagSummaryDto(tag));
    } else {
      const taskTags = (data as { taskTags?: TaskTagLite[] }).taskTags;
      this.tags = Array.isArray(taskTags)
        ? taskTags
            .filter(
              (item) => item.deletedAt === null && item.tag?.deletedAt == null,
            )
            .map((item) => new TaskTagSummaryDto(item.tag))
        : [];
    }
  }
}

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  orderTask: z.number().int(),
  dueDate: z.date().optional(),
  listId: z.string().uuid(),
  assign: z.array(z.string().uuid()),
  tags: z.array(taskTagSummarySchema),
  status: z.enum(TaskStatus),
  statusAction: z.enum(TaskStatusAction),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Response trả về cho endpoint move / reorder task.
// - movedTask: task vừa được move với listId, orderTask mới.
// - sourceTasks: task còn lại trong list nguồn (có thể rỗng nếu move trong cùng list).
// - targetTasks: task trong list đích sau khi reorder.
export class MoveTaskResponseDto {
  movedTask: TaskResponseDto;
  sourceTasks: TaskResponseDto[];
  targetTasks: TaskResponseDto[];

  constructor(data: MoveTaskResponseDto) {
    this.movedTask = data.movedTask;
    this.sourceTasks = data.sourceTasks;
    this.targetTasks = data.targetTasks;
  }
}

export const moveTaskResponseSchema = z.object({
  movedTask: taskResponseSchema,
  sourceTasks: z.array(taskResponseSchema),
  targetTasks: z.array(taskResponseSchema),
});
