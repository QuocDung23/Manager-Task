import { BadRequest, Exception } from "@tsed/exceptions";
import {
  ForbiddenException,
  HttpResponseBodySuccessDto,
  NotFoundException,
  OptionalException,
} from "@/common";
import { StatusCodes } from "http-status-codes";
import {
  AssignTaskRequestDto,
  ClearTaskScheduleRequestDto,
  CreateTaskRequestDto,
  GetAllTaskRequestDto,
  GetTaskByIdRequestDto,
  MoveTaskRequestDto,
  SetTaskScheduleRequestDto,
  UnassignTaskRequestDto,
  UnlockTaskRequestDto,
  updateTaskRequestDto,
  UpdateTaskStatusActionRequestDto,
} from "./dtos/request";

import { MoveTaskResponseDto, TaskResponseDto } from "./dtos/response";
import {
  Prisma,
  TaskLockStatus,
  TaskScheduleEventType,
  TaskStatusAction,
  tasks,
} from "@prisma/client";
import { ListRepository } from "@/modules/lists/list.repository";
import { BoardMemberRepository } from "@/modules/boardMember/boardMember.repository";
import { TaskWithAssignments, TaskRepository } from "./task.repository";
import { taskScheduleConfig } from "@/configs";
import { realtimeEventService } from "@/modules/realtime";
import { notificationService } from "@/modules/notification";

const ORDER_STEP = 65536;

type TaskNotificationType =
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE_LOCKED"
  | "TASK_RESCHEDULED"
  | "TASK_SCHEDULE_UPDATED"
  | "TASK_UNLOCKED";

// Re-export để giữ type liên quan ở gần service khi cần.
export type { TaskWithAssignments };

export class TaskService {
  constructor(
    private readonly taskRepository = new TaskRepository(),
    private readonly listRepository = new ListRepository(),
    private readonly boardMemberRepository = new BoardMemberRepository(),
  ) {}

  /**
   * Mapper chuẩn hoá việc map Prisma task (có thể kèm `taskAssignments`)
   * sang `TaskResponseDto`. Đảm bảo field `assign` luôn đúng với dữ liệu thật.
   */
  private toTaskResponse(task: TaskWithAssignments): TaskResponseDto {
    return new TaskResponseDto(task as unknown as TaskResponseDto);
  }

  private async getActiveTaskOrThrow(taskId: string): Promise<tasks> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    return task;
  }

  private isTerminalAction(statusAction: TaskStatusAction): boolean {
    return (
      statusAction === TaskStatusAction.DONE ||
      statusAction === TaskStatusAction.CANCELLED
    );
  }

  private assertValidSchedule(dueDate: Date, reminderAt?: Date | null): void {
    const now = new Date();
    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequest("dueDate is invalid");
    }
    if (dueDate.getTime() <= now.getTime()) {
      throw new BadRequest("dueDate must be in the future");
    }
    if (reminderAt) {
      if (Number.isNaN(reminderAt.getTime())) {
        throw new BadRequest("reminderAt is invalid");
      }
      if (reminderAt.getTime() <= now.getTime()) {
        throw new BadRequest("reminderAt must be in the future");
      }
      if (reminderAt.getTime() >= dueDate.getTime()) {
        throw new BadRequest("reminderAt must be before dueDate");
      }
    }
  }

  private assertTaskNotLocked(task: Pick<tasks, "lockStatus">, action: string) {
    if (task.lockStatus === TaskLockStatus.OVERDUE_LOCKED) {
      throw new ForbiddenException(
        `Task is locked because it is overdue. Please reschedule before ${action}.`,
      );
    }
  }

  private async notifyTaskRecipients(args: {
    taskId: string;
    type: TaskNotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<string[]> {
    const recipientIds = await this.taskRepository.getTaskNotificationRecipients(
      args.taskId,
    );
    const payload = {
      type: args.type,
      title: args.title,
      body: args.body,
      data: args.data ?? {},
      createdAt: new Date(),
    };

    recipientIds.forEach((userId) => {
      realtimeEventService.emitUserNotification(userId, payload);
    });

    return recipientIds;
  }

  /**
   * Resolve boardId chứa task thông qua chain: task -> list -> board.
   * Dùng trong các flow cần kiểm tra boardMember (assign/unassign).
   */
  private async resolveBoardIdByTaskId(taskId: string): Promise<string> {
    const task = await this.taskRepository.getTaskWithList(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    const list = task.list;
    if (!list || list.deletedAt !== null) {
      throw new NotFoundException("List not found");
    }
    return list.boardId;
  }

  async createTask(
    createTaskDto: CreateTaskRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    if (createTaskDto.reminderAt && !createTaskDto.dueDate) {
      throw new BadRequest("reminderAt requires dueDate");
    }
    if (createTaskDto.dueDate) {
      this.assertValidSchedule(createTaskDto.dueDate, createTaskDto.reminderAt);
    }

    // chọn 65536 vì nó = 2^16 đủ lớn để có thể drag drop ổn định
    const orderTask =
      (await this.taskRepository.getMaxOrderTask(createTaskDto.listId)) + 65536;

    const data: Prisma.tasksCreateInput = {
      name: createTaskDto.name,
      description: createTaskDto.description ?? "",
      orderTask,
      dueDate: createTaskDto.dueDate,
      reminderAt: createTaskDto.reminderAt ?? null,
      list: { connect: { id: createTaskDto.listId } },
    };
    const createTask = await this.taskRepository.createTask(
      data,
      createTaskDto.dueDate
        ? {
            actorId: actorUserId,
            newDueDate: createTaskDto.dueDate,
            metadata: {
              reminderAt: createTaskDto.reminderAt?.toISOString() ?? null,
            },
          }
        : undefined,
    );

    const taskWithAssignments =
      await this.taskRepository.getTaskByIdWithAssignments(createTask.id);
    const response = taskWithAssignments
      ? this.toTaskResponse(taskWithAssignments)
      : this.toTaskResponse(createTask as TaskWithAssignments);

    if (createTaskDto.dueDate) {
      realtimeEventService.emitTaskScheduleUpdated(createTask.id, response);
    }

    return {
      success: true,
      data: response,
    };
  }

  async getAllTasks(
    getAllTaskDto: GetAllTaskRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto[]> | Exception> {
    const {
      listId,
      name,
      status,
      tagIds,
      tagMode,
      dueBefore,
      dueAfter,
      scheduleState,
      lockStatus,
    } = getAllTaskDto;
    const now = new Date();

    const tasks = await this.taskRepository.getTasks({
      listId,
      name,
      status,
      tagIds,
      tagMode,
      dueBefore,
      dueAfter,
      scheduleState,
      lockStatus,
      now,
      dueSoonBefore: new Date(
        now.getTime() + taskScheduleConfig.reminderBeforeMinutes * 60 * 1000,
      ),
    });

    const listResponse = tasks.map((task) => this.toTaskResponse(task));

    return {
      success: true,
      data: listResponse,
    };
  }

  async getTaskById(
    getTaskByIdDto: GetTaskByIdRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.taskRepository.getTaskByIdWithAssignments(
      getTaskByIdDto.id,
    );
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return {
      success: true,
      data: this.toTaskResponse(task),
    };
  }

  async updateTask(
    updateTaskDto: updateTaskRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.taskRepository.getTaskById(updateTaskDto.id);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    this.assertTaskNotLocked(task, "updating it");

    const updateData: Prisma.tasksUpdateInput = {
      name: updateTaskDto.name,
      description: updateTaskDto.description,
    };
    const updateTask = await this.taskRepository.updateTask(
      updateTaskDto.id,
      updateData,
    );

    // Query lại kèm assignments để response trả đúng `assign`.
    const taskWithAssignments =
      await this.taskRepository.getTaskByIdWithAssignments(updateTask.id);

    return {
      success: true,
      data: taskWithAssignments
        ? this.toTaskResponse(taskWithAssignments)
        : this.toTaskResponse(updateTask as TaskWithAssignments),
    };
  }

  async deleteTask(
    deleteTaskDto: GetTaskByIdRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.taskRepository.getTaskById(deleteTaskDto.id);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const deleteTask = await this.taskRepository.deleteTask(deleteTaskDto.id);
    return {
      success: true,
      data: this.toTaskResponse(deleteTask as TaskWithAssignments),
    };
  }

  /**
   * Move / reorder task theo kiểu Trello.
   * - Hỗ trợ cả 2 case: reorder trong cùng list, hoặc move sang list khác cùng board.
   * - FE gửi `orderedTaskIds` = toàn bộ task id active trong list đích sau khi thả,
   *   theo đúng thứ tự mới. BE validate rồi gán lại `orderTask` theo step 65536.
   */
  async moveTask(
    moveTaskDto: MoveTaskRequestDto,
  ): Promise<HttpResponseBodySuccessDto<MoveTaskResponseDto> | Exception> {
    const { taskId, sourceListId, targetListId, orderedTaskIds } = moveTaskDto;

    // 1. orderedTaskIds phải có dữ liệu và không được trùng id
    if (!orderedTaskIds || orderedTaskIds.length === 0) {
      throw new BadRequest("orderedTaskIds is required");
    }
    const uniqueIds = Array.from(new Set(orderedTaskIds));
    if (uniqueIds.length !== orderedTaskIds.length) {
      throw new BadRequest("orderedTaskIds contains duplicates");
    }

    // 2. orderedTaskIds phải chứa taskId đang move
    if (!uniqueIds.includes(taskId)) {
      throw new BadRequest(
        "orderedTaskIds must contain the taskId being moved",
      );
    }

    // 3. task phải tồn tại, chưa bị xoá
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException(`Task not found (${taskId})`);
    }
    this.assertTaskNotLocked(task, "moving it");

    // 4. task phải đang thuộc sourceListId (chống move task nhưng gửi sai source)
    if (task.listId !== sourceListId) {
      throw new BadRequest(
        `Task ${taskId} does not belong to sourceListId ${sourceListId}`,
      );
    }

    // 5. source list và target list phải tồn tại
    const sourceList = await this.listRepository.getListById(sourceListId);
    if (!sourceList) {
      throw new NotFoundException(`List not found (${sourceListId})`);
    }

    const targetList = await this.listRepository.getListById(targetListId);
    if (!targetList) {
      throw new NotFoundException(`List not found (${targetListId})`);
    }

    // 6. source list và target list phải cùng board
    if (sourceList.boardId !== targetList.boardId) {
      throw new BadRequest(
        "sourceListId and targetListId must belong to the same board",
      );
    }

    const isSameList = sourceListId === targetListId;

    // 7. lấy toàn bộ active task của target list (kèm cả task đang move nếu cùng list)
    const targetTasks =
      await this.taskRepository.getTasksByListId(targetListId);
    const targetActiveIds = new Set(targetTasks.map((t) => t.id));

    if (isSameList) {
      // 8a. move trong cùng list:
      // orderedTaskIds phải match đúng toàn bộ active tasks của list đó
      if (uniqueIds.length !== targetActiveIds.size) {
        throw new BadRequest(
          "orderedTaskIds must contain all active tasks of the list (reorder in same list)",
        );
      }
      for (const id of uniqueIds) {
        if (!targetActiveIds.has(id)) {
          throw new BadRequest(
            `Task ${id} does not belong to list ${targetListId}`,
          );
        }
      }
    } else {
      // 8b. move sang list khác:
      // - tất cả id trong orderedTaskIds phải thuộc target list cũ, hoặc chính là taskId đang move.
      // - tập task active của target (sau khi bỏ taskId) phải nằm gọn trong orderedTaskIds.
      for (const id of uniqueIds) {
        if (id === taskId) continue;
        if (!targetActiveIds.has(id)) {
          throw new BadRequest(
            `Task ${id} does not belong to targetListId ${targetListId}`,
          );
        }
      }

      // expected ids = target active ids hiện tại + taskId
      const expectedIds = new Set<string>(targetActiveIds);
      expectedIds.add(taskId);

      if (uniqueIds.length !== expectedIds.size) {
        throw new BadRequest(
          "orderedTaskIds size does not match target list active tasks + moved task",
        );
      }
      for (const id of uniqueIds) {
        if (!expectedIds.has(id)) {
          throw new BadRequest(
            `Task ${id} is not in target list and is not the moved task`,
          );
        }
      }
    }

    // 9. tạo updates cho target list (theo index * step)
    const targetUpdates: Array<{
      id: string;
      listId?: string;
      orderTask: number;
    }> = [];
    uniqueIds.forEach((id, index) => {
      if (id === taskId) {
        targetUpdates.push({
          id,
          listId: targetListId,
          orderTask: index * ORDER_STEP,
        });
      } else {
        targetUpdates.push({
          id,
          orderTask: index * ORDER_STEP,
        });
      }
    });

    // 10. nếu move sang list khác, reorder lại source list còn lại để đóng khoảng trống
    const sourceUpdates: Array<{ id: string; orderTask: number }> = [];
    if (!isSameList) {
      const sourceTasks =
        await this.taskRepository.getTasksByListId(sourceListId);
      const remainingSource = sourceTasks.filter((t) => t.id !== taskId);
      remainingSource.forEach((t, index) => {
        sourceUpdates.push({
          id: t.id,
          orderTask: index * ORDER_STEP,
        });
      });
    }

    // 11. chạy tất cả updates trong transaction (repository sẽ gói trong $transaction)
    await this.taskRepository.updateTaskOrders([
      ...targetUpdates,
      ...sourceUpdates,
    ]);

    // 12. query lại source/target tasks sort theo orderTask ASC, kèm assignments
    const targetIds = isSameList
      ? uniqueIds
      : Array.from(new Set([...uniqueIds]));
    const sourceIds = isSameList ? [] : uniqueIds; // không cần thiết, dùng getTasksByListId bên dưới

    const updatedTargetTasks =
      await this.taskRepository.getTasksWithAssignmentsByListId(targetListId);

    let updatedSourceTasks: TaskWithAssignments[] = [];
    if (!isSameList) {
      updatedSourceTasks =
        await this.taskRepository.getTasksWithAssignmentsByListId(sourceListId);
    }

    // 13. lấy ra task vừa move (sau khi update) từ target list
    const movedTaskRecord = updatedTargetTasks.find((t) => t.id === taskId);
    if (!movedTaskRecord) {
      // Defensive: trong cùng list, task vẫn nằm trong target; chỉ rơi vào đây nếu
      // cực kỳ bất thường (vd transaction fail). Trả lỗi chung.
      throw new NotFoundException(`Moved task not found (${taskId})`);
    }

    // Suppress unused warnings for future-proof variables (kept for clarity).
    void targetIds;
    void sourceIds;

    const response = new MoveTaskResponseDto({
      movedTask: this.toTaskResponse(movedTaskRecord),
      sourceTasks: updatedSourceTasks.map((t) => this.toTaskResponse(t)),
      targetTasks: updatedTargetTasks.map((t) => this.toTaskResponse(t)),
    });

    return {
      success: true,
      data: response,
    };
  }

  async assignTask(
    assignTaskDto: AssignTaskRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const { taskId, userIds } = assignTaskDto;

    // dedupe ở tầng service (zod đã enforce, nhưng double-check defensive)
    const uniqueUserIds = Array.from(new Set(userIds));
    if (uniqueUserIds.length !== userIds.length) {
      throw new BadRequest("userIds contains duplicates");
    }

    const task = await this.getActiveTaskOrThrow(taskId);
    this.assertTaskNotLocked(task, "assigning members");

    // 1. suy ra boardId từ task -> list
    const boardId = await this.resolveBoardIdByTaskId(taskId);

    // 2. kiểm tra tất cả userId đều là active board member của board đó
    const members =
      await this.boardMemberRepository.getActiveBoardMembersByUserIds(
        boardId,
        uniqueUserIds,
      );

    const memberUserIds = new Set(members.map((m) => m.userId));
    const notMembers = uniqueUserIds.filter((u) => !memberUserIds.has(u));

    if (notMembers.length > 0) {
      throw new ForbiddenException(
        `The following users are not active members of this board: ${notMembers.join(", ")}`,
      );
    }

    // 3. replace assignments trong transaction
    const updatedTask = await this.taskRepository.replaceTaskAssignments(
      taskId,
      uniqueUserIds,
      actorUserId,
    );
    if (!updatedTask) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updatedTask);

    // 4. emit realtime event sau commit
    realtimeEventService.emitTaskAssignmentsUpdated({
      boardId,
      taskId,
      task: response,
      actorId: actorUserId,
    });

    return {
      success: true,
      data: response,
    };
  }

  async unassignTask(
    unassignTaskDto: UnassignTaskRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const { taskId, userId } = unassignTaskDto;

    // đảm bảo task tồn tại (cũng giúp middleware phía trên không cần kiểm tra)
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    this.assertTaskNotLocked(task, "unassigning members");

    // kiểm tra assignment active
    const existing = await this.taskRepository.getTaskAssignment(
      taskId,
      userId,
    );
    if (!existing || existing.deletedAt !== null) {
      throw new NotFoundException("Task assignment not found");
    }

    // resolve boardId từ task -> list
    const boardId = await this.resolveBoardIdByTaskId(taskId);

    const updatedTask = await this.taskRepository.removeTaskAssignment(
      taskId,
      userId,
    );
    if (!updatedTask) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updatedTask);

    // emit realtime event sau commit
    realtimeEventService.emitTaskAssignmentsUpdated({
      boardId,
      taskId,
      task: response,
      actorId: actorUserId,
    });

    return {
      success: true,
      data: response,
    };
  }

  async setTaskSchedule(
    dto: SetTaskScheduleRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.getActiveTaskOrThrow(dto.taskId);
    if (this.isTerminalAction(task.statusAction)) {
      throw new BadRequest("Cannot schedule a completed or cancelled task");
    }

    const reason = dto.reason?.trim();
    this.assertValidSchedule(dto.dueDate, dto.reminderAt);

    const isLocked = task.lockStatus !== TaskLockStatus.UNLOCKED;
    if (isLocked && !reason) {
      throw new BadRequest("reason is required when rescheduling a locked task");
    }

    const eventType =
      task.dueDate || isLocked
        ? TaskScheduleEventType.RESCHEDULED
        : TaskScheduleEventType.SCHEDULED;

    const updatedTask = await this.taskRepository.updateTaskSchedule({
      taskId: dto.taskId,
      dueDate: dto.dueDate,
      reminderAt: dto.reminderAt ?? null,
      actorId: actorUserId,
      reason,
      eventType,
      oldDueDate: task.dueDate,
      incrementRescheduleCount: eventType === TaskScheduleEventType.RESCHEDULED,
    });
    if (!updatedTask) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updatedTask);
    if (eventType === TaskScheduleEventType.RESCHEDULED) {
      realtimeEventService.emitTaskRescheduled(dto.taskId, response);
      await this.notifyTaskRecipients({
        taskId: dto.taskId,
        type: "TASK_RESCHEDULED",
        title: "Task đã được đổi lịch",
        body: `Task "${response.name}" đã được đổi deadline.`,
        data: {
          taskId: dto.taskId,
          dueDate: dto.dueDate.toISOString(),
          reminderAt: dto.reminderAt?.toISOString() ?? null,
        },
      });
    } else {
      realtimeEventService.emitTaskScheduleUpdated(dto.taskId, response);
      await this.notifyTaskRecipients({
        taskId: dto.taskId,
        type: "TASK_SCHEDULE_UPDATED",
        title: "Task đã được đặt lịch",
        body: `Task "${response.name}" đã có deadline mới.`,
        data: {
          taskId: dto.taskId,
          dueDate: dto.dueDate.toISOString(),
          reminderAt: dto.reminderAt?.toISOString() ?? null,
        },
      });
    }

    return {
      success: true,
      data: response,
    };
  }

  async clearTaskSchedule(
    dto: ClearTaskScheduleRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.getActiveTaskOrThrow(dto.taskId);
    if (task.lockStatus === TaskLockStatus.OVERDUE_LOCKED) {
      throw new ForbiddenException(
        "Task is locked because it is overdue. Please reschedule before clearing schedule.",
      );
    }

    const updatedTask = await this.taskRepository.clearTaskSchedule({
      taskId: dto.taskId,
      actorId: actorUserId,
      reason: dto.reason?.trim(),
      oldDueDate: task.dueDate,
    });
    if (!updatedTask) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updatedTask);
    realtimeEventService.emitTaskScheduleUpdated(dto.taskId, response);

    return {
      success: true,
      data: response,
    };
  }

  async unlockTask(
    dto: UnlockTaskRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.getActiveTaskOrThrow(dto.taskId);
    if (task.lockStatus === TaskLockStatus.UNLOCKED) {
      const taskWithAssignments =
        await this.taskRepository.getTaskByIdWithAssignments(dto.taskId);
      return {
        success: true,
        data: this.toTaskResponse(
          (taskWithAssignments ?? task) as TaskWithAssignments,
        ),
      };
    }

    const updatedTask = await this.taskRepository.unlockTask({
      taskId: dto.taskId,
      actorId: actorUserId,
      reason: dto.reason.trim(),
      oldDueDate: task.dueDate,
    });
    if (!updatedTask) {
      throw new NotFoundException("Task not found");
    }

    const response = this.toTaskResponse(updatedTask);
    realtimeEventService.emitTaskUnlocked(dto.taskId, response);
    await this.notifyTaskRecipients({
      taskId: dto.taskId,
      type: "TASK_UNLOCKED",
      title: "Task đã được mở khoá",
      body: `Task "${response.name}" đã được mở khoá.`,
      data: {
        taskId: dto.taskId,
        reason: dto.reason,
      },
    });

    return {
      success: true,
      data: response,
    };
  }

  async processDueReminders(now = new Date()): Promise<number> {
    const defaultReminderAt = new Date(
      now.getTime() + taskScheduleConfig.reminderBeforeMinutes * 60 * 1000,
    );
    const tasks = await this.taskRepository.getTasksDueForReminder({
      now,
      defaultReminderAt,
      take: taskScheduleConfig.batchSize,
    });

    let sentCount = 0;
    for (const task of tasks) {
      const marked = await this.taskRepository.markReminderSent({
        taskId: task.id,
        now,
        defaultReminderAt,
      });
      if (!marked || !task.dueDate) {
        continue;
      }

      sentCount += 1;
      realtimeEventService.emitTaskDueSoon(task.id, {
        taskId: task.id,
        dueDate: task.dueDate,
        reminderAt: task.reminderAt ?? null,
      });

      // Gửi email cho tất cả assignees song song
      const assignees = await this.taskRepository.getTaskAssignees(task.id);
      const dueDate = task.dueDate!;
      await Promise.all(
        assignees.map((assignee) =>
          notificationService.sendTaskDueSoonEmail({
            taskId: task.id,
            taskName: task.name,
            dueDate,
            assigneeEmail: assignee.email,
            assigneeName: assignee.name,
          }),
        ),
      );

      await this.notifyTaskRecipients({
        taskId: task.id,
        type: "TASK_DUE_SOON",
        title: "Task sắp tới hạn",
        body: `Task "${task.name}" sắp tới deadline.`,
        data: {
          taskId: task.id,
          dueDate: task.dueDate.toISOString(),
          reminderAt: task.reminderAt?.toISOString() ?? null,
        },
      });
    }

    return sentCount;
  }

  async processOverdueLocks(now = new Date()): Promise<number> {
    const graceMs = taskScheduleConfig.lockGraceMinutes * 60 * 1000;
    const lockBefore = new Date(now.getTime() - graceMs);
    const tasks = await this.taskRepository.getOverdueTasksToLock({
      now: lockBefore,
      take: taskScheduleConfig.batchSize,
    });

    let lockedCount = 0;
    for (const task of tasks) {
      const lockedTask = await this.taskRepository.lockTaskAsOverdue(
        task.id,
        now,
        lockBefore,
      );
      if (!lockedTask || !lockedTask.dueDate || !lockedTask.lockedAt) {
        continue;
      }

      lockedCount += 1;
      realtimeEventService.emitTaskOverdueLocked(task.id, {
        taskId: task.id,
        dueDate: lockedTask.dueDate,
        lockedAt: lockedTask.lockedAt,
        lockStatus: TaskLockStatus.OVERDUE_LOCKED,
      });

      // Gửi email thông báo quá hạn cho tất cả assignees song song
      const assignees = await this.taskRepository.getTaskAssignees(task.id);
      const dueDate = lockedTask.dueDate!;
      const lockedAt = lockedTask.lockedAt!;
      await Promise.all(
        assignees.map((assignee) =>
          notificationService.sendTaskOverdueEmail({
            taskId: task.id,
            taskName: lockedTask.name,
            dueDate,
            lockedAt,
            assigneeEmail: assignee.email,
            assigneeName: assignee.name,
          }),
        ),
      );

      await this.notifyTaskRecipients({
        taskId: task.id,
        type: "TASK_OVERDUE_LOCKED",
        title: "Task quá hạn và đã bị khoá",
        body: `Task "${lockedTask.name}" đã quá hạn hoàn thành.`,
        data: {
          taskId: task.id,
          dueDate: lockedTask.dueDate.toISOString(),
          lockedAt: lockedTask.lockedAt.toISOString(),
          lockStatus: TaskLockStatus.OVERDUE_LOCKED,
        },
      });
    }

    return lockedCount;
  }

  /**
   * Cập nhật `statusAction` cho task.
   * Quy tắc nghiệp vụ:
   *  - task phải tồn tại và chưa bị soft delete (handled by `getTaskById`).
   *  - chỉ user đang là assignee active của task mới được đổi `statusAction`.
   *  - `statusAction` được Zod validate ở tầng middleware nên không cần check lại.
   */
  async updateTaskStatusAction(
    dto: UpdateTaskStatusActionRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    if (!actorUserId) {
      throw new ForbiddenException("Missing actor");
    }

    const task = await this.taskRepository.getTaskById(dto.taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    if (
      task.lockStatus === TaskLockStatus.OVERDUE_LOCKED &&
      dto.statusAction !== TaskStatusAction.DONE
    ) {
      throw new ForbiddenException(
        "Task is locked because it is overdue. Please reschedule before changing status.",
      );
    }

    const isAssignee = await this.taskRepository.isTaskAssignee(
      dto.taskId,
      actorUserId,
    );
    if (!isAssignee) {
      throw new ForbiddenException(
        "Only assigned members can update task status action",
      );
    }

    await this.taskRepository.updateTaskStatusAction(
      dto.taskId,
      dto.statusAction,
      actorUserId,
    );

    const taskWithAssignments =
      await this.taskRepository.getTaskByIdWithAssignments(dto.taskId);
    if (!taskWithAssignments) {
      throw new NotFoundException("Task not found");
    }
    const response = this.toTaskResponse(taskWithAssignments);

    if (dto.statusAction === TaskStatusAction.DONE) {
      realtimeEventService.emitTaskScheduleUpdated(dto.taskId, response);
    }

    return {
      success: true,
      data: response,
    };
  }
}
