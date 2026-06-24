import { BadRequest, Exception } from "@tsed/exceptions";
import {
  HttpResponseBodySuccessDto,
  NotFoundException,
} from "@/common";
import {
  CreateTaskRequestDto,
  GetAllTaskRequestDto,
  GetTaskByIdRequestDto,
  MoveTaskRequestDto,
  updateTaskRequestDto,
} from "./dtos/request";
import { TaskRepository } from "./task.repository";
import {
  MoveTaskResponseDto,
  TaskResponseDto,
} from "./dtos/response";
import { Prisma, tasks } from "@prisma/client";
import { ListRepository } from "@/modules/lists/list.repository";

const ORDER_STEP = 65536;

export class TaskService {
  constructor(
    private readonly taskRepository = new TaskRepository(),
    private readonly listRepository = new ListRepository(),
  ) {}

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
    const { listId, name, status } = getAllTaskDto;

    const tasks = await this.taskRepository.getTasks({
      listId,
      name,
      status,
    });

    const listResponse = tasks.map(
      (task) => new TaskResponseDto(task as TaskResponseDto),
    );

    return {
      success: true,
      data: listResponse,
    };
  }

  async getTaskById(getTaskByIdDto: GetTaskByIdRequestDto): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.taskRepository.getTaskById(getTaskByIdDto.id)
    if(!task) {
      throw new NotFoundException('Task not found')
    }

    return {
      success: true,
      data: new TaskResponseDto(task as TaskResponseDto)
    }
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

    return {
      success: true,
      data: new TaskResponseDto(updateTask as TaskResponseDto),
    };
  }

  async deleteTask(deleteTaskDto: GetTaskByIdRequestDto): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const task = await this.taskRepository.getTaskById(deleteTaskDto.id)
    if(!task) {
      throw new NotFoundException('Task not found')
    }

    const deleteTask = await this.taskRepository.deleteTask(deleteTaskDto.id)
    return {
      success: true,
      data: new TaskResponseDto(deleteTask as TaskResponseDto)
    }
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
    const {
      taskId,
      sourceListId,
      targetListId,
      orderedTaskIds,
    } = moveTaskDto;

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
    const targetTasks = await this.taskRepository.getTasksByListId(
      targetListId,
    );
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
    const targetUpdates: Array<{ id: string; listId?: string; orderTask: number }> = [];
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
      const sourceTasks = await this.taskRepository.getTasksByListId(
        sourceListId,
      );
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

    // 12. query lại source/target tasks sort theo orderTask ASC
    const updatedTargetTasks: tasks[] = await this.taskRepository.getTasksByListId(
      targetListId,
    );

    let updatedSourceTasks: tasks[] = [];
    if (!isSameList) {
      updatedSourceTasks = await this.taskRepository.getTasksByListId(
        sourceListId,
      );
    }

    // 13. lấy ra task vừa move (sau khi update) từ target list
    const movedTaskRecord = updatedTargetTasks.find((t) => t.id === taskId);
    if (!movedTaskRecord) {
      // Defensive: trong cùng list, task vẫn nằm trong target; chỉ rơi vào đây nếu
      // cực kỳ bất thường (vd transaction fail). Trả lỗi chung.
      throw new NotFoundException(`Moved task not found (${taskId})`);
    }

    const response = new MoveTaskResponseDto({
      movedTask: new TaskResponseDto(movedTaskRecord as TaskResponseDto),
      sourceTasks: updatedSourceTasks.map(
        (t) => new TaskResponseDto(t as TaskResponseDto),
      ),
      targetTasks: updatedTargetTasks.map(
        (t) => new TaskResponseDto(t as TaskResponseDto),
      ),
    });

    return {
      success: true,
      data: response,
    };
  }
}
