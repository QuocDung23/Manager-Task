import { TaskLockStatus, TaskStatus, TaskStatusAction } from "@prisma/client";
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

export type TaskScheduleState =
  | "none"
  | "scheduled"
  | "due_soon"
  | "overdue_locked"
  | "done";

export class TaskResponseDto {
  id: string;
  name: string;
  description?: string;
  orderTask: number;
  dueDate: Date | null;
  reminderAt: Date | null;
  reminderSentAt: Date | null;
  overdueNotifiedAt: Date | null;
  lockedAt: Date | null;
  lockStatus: TaskLockStatus;
  lockReason: string | null;
  rescheduleCount: number;
  completedAt: Date | null;
  isLocked: boolean;
  isOverdue: boolean;
  scheduleState: TaskScheduleState;
  listId: string;
  assign: string[];
  tags: TaskTagSummaryDto[];
  status: TaskStatus;
  statusAction: TaskStatusAction;
  tagVersion: number;
  assignmentVersion: number;

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
    this.dueDate = data.dueDate ?? null;
    this.reminderAt = data.reminderAt ?? null;
    this.reminderSentAt = data.reminderSentAt ?? null;
    this.overdueNotifiedAt = data.overdueNotifiedAt ?? null;
    this.lockedAt = data.lockedAt ?? null;
    this.lockStatus = data.lockStatus ?? TaskLockStatus.UNLOCKED;
    this.lockReason = data.lockReason ?? null;
    this.rescheduleCount = data.rescheduleCount ?? 0;
    this.completedAt = data.completedAt ?? null;
    this.listId = data.listId;
    this.status = data.status;
    this.statusAction = data.statusAction;
    this.tagVersion = data.tagVersion ?? 0;
    this.assignmentVersion = (data as TaskResponseDto).assignmentVersion ?? 0;
    this.isLocked = this.lockStatus !== TaskLockStatus.UNLOCKED;
    this.isOverdue =
      this.dueDate !== null &&
      this.dueDate.getTime() < Date.now() &&
      !this.isTerminalAction();
    this.scheduleState = this.resolveScheduleState();

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

  private isTerminalAction(): boolean {
    return (
      this.statusAction === TaskStatusAction.DONE ||
      this.statusAction === TaskStatusAction.CANCELLED
    );
  }

  private resolveScheduleState(): TaskScheduleState {
    if (this.isTerminalAction()) {
      return "done";
    }

    if (this.lockStatus === TaskLockStatus.OVERDUE_LOCKED) {
      return "overdue_locked";
    }

    if (!this.dueDate) {
      return "none";
    }

    const now = Date.now();
    if (
      this.reminderAt &&
      this.reminderAt.getTime() <= now &&
      this.dueDate.getTime() > now
    ) {
      return "due_soon";
    }

    return "scheduled";
  }
}

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  orderTask: z.number().int(),
  dueDate: z.date().nullable(),
  reminderAt: z.date().nullable(),
  reminderSentAt: z.date().nullable(),
  overdueNotifiedAt: z.date().nullable(),
  lockedAt: z.date().nullable(),
  lockStatus: z.enum(TaskLockStatus),
  lockReason: z.string().nullable(),
  rescheduleCount: z.number().int(),
  completedAt: z.date().nullable(),
  isLocked: z.boolean(),
  isOverdue: z.boolean(),
  scheduleState: z.enum([
    "none",
    "scheduled",
    "due_soon",
    "overdue_locked",
    "done",
  ]),
  listId: z.string().uuid(),
  assign: z.array(z.string().uuid()),
  tags: z.array(taskTagSummarySchema),
  status: z.enum(TaskStatus),
  statusAction: z.enum(TaskStatusAction),
  tagVersion: z.number().int().nonnegative(),
  assignmentVersion: z.number().int().nonnegative(),

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
