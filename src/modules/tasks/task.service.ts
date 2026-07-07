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
  CreateTaskRequestDto,
  GetAllTaskRequestDto,
  GetTaskByIdRequestDto,
  MoveTaskRequestDto,
  UnassignTaskRequestDto,
  updateTaskRequestDto,
} from "./dtos/request";

import { MoveTaskResponseDto, TaskResponseDto } from "./dtos/response";
import { Prisma, tasks } from "@prisma/client";
import { ListRepository } from "@/modules/lists/list.repository";
import { BoardMemberRepository } from "@/modules/boardMember/boardMember.repository";
import { TaskWithAssignments, TaskRepository } from "./task.repository";

const ORDER_STEP = 65536;

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
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    // chọn 65536 vì nó = 2^16 đủ lớn để có thể drag drop ổn định
    const orderTask =
      (await this.taskRepository.getMaxOrderTask(createTaskDto.listId)) + 65536;

    const data: Prisma.tasksCreateInput = {
      name: createTaskDto.name,
      description: createTaskDto.description ?? "",
      orderTask,
      list: { connect: { id: createTaskDto.listId } },
    };
    const createTask = await this.taskRepository.createTask(data);

    return {
      success: true,
      data: new TaskResponseDto(createTask as TaskResponseDto),
    };
  }

  async getAllTasks(
    getAllTaskDto: GetAllTaskRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto[]> | Exception> {
    const { listId, name, status, tagIds, tagMode } = getAllTaskDto;

    const tasks = await this.taskRepository.getTasks({
      listId,
      name,
      status,
      tagIds,
      tagMode,
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

    return {
      success: true,
      data: this.toTaskResponse(updatedTask),
    };
  }

  async unassignTask(
    unassignTaskDto: UnassignTaskRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const { taskId, userId } = unassignTaskDto;

    // đảm bảo task tồn tại (cũng giúp middleware phía trên không cần kiểm tra)
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // kiểm tra assignment active
    const existing = await this.taskRepository.getTaskAssignment(
      taskId,
      userId,
    );
    if (!existing || existing.deletedAt !== null) {
      throw new NotFoundException("Task assignment not found");
    }

    const updatedTask = await this.taskRepository.removeTaskAssignment(
      taskId,
      userId,
    );
    if (!updatedTask) {
      throw new NotFoundException("Task not found");
    }

    return {
      success: true,
      data: this.toTaskResponse(updatedTask),
    };
  }
}
