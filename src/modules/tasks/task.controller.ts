import { Exception } from "@tsed/exceptions";
import {
  AssignTaskRequestDto,
  CreateTaskRequestDto,
  GetAllTaskRequestDto,
  GetTaskByIdRequestDto,
  MoveTaskRequestDto,
  UnassignTaskRequestDto,
  updateTaskRequestDto,
  UpdateTaskStatusActionRequestDto,
} from "./dtos/request";
import { TaskService } from "./task.service";
import { Request, Response } from "express";
import { HttpResponseDto } from "@/common";

export class TaskController {
  constructor(
    private readonly taskService = new TaskService(),
  ) {}

  async createTask(req: Request, res: Response): Promise<Response> {
    const listId = req.params.listId;
    const payload = {
      ...req.body,
      listId,
    } as CreateTaskRequestDto;
    const result = await this.taskService.createTask(payload);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().created(res, result);
  }

  async getAllTask(req: Request, res: Response): Promise<Response> {
    const listId = req.params.listId;
    const getAllTask = new GetAllTaskRequestDto({
      ...(req.query as any),
      listId,
    });
    const result = await this.taskService.getAllTasks(getAllTask);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async getTaskById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    const taskDto = new GetTaskByIdRequestDto({ id } as GetTaskByIdRequestDto);
    const result = await this.taskService.getTaskById(taskDto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async updateTask(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    const updateTaskDto = new updateTaskRequestDto({
      ...(req.body as any),
      id,
    });
    const result = await this.taskService.updateTask(updateTaskDto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async deleteTask(req: Request, res: Response): Promise<Response> {
    const id = req.params.id
    const deleteTaskDto = new GetTaskByIdRequestDto({id} as GetTaskByIdRequestDto)
    const result = await this.taskService.deleteTask(deleteTaskDto)
    if(result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result)
    }
    return new HttpResponseDto().success(res, result)
  }

  async moveTask(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const moveTaskDto = new MoveTaskRequestDto({
      ...(req.body as any),
      taskId,
    } as MoveTaskRequestDto);

    const result = await this.taskService.moveTask(moveTaskDto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  /**
   * PATCH /task/:taskId/assign
   * Replace toàn bộ assignee của task bằng `userIds`.
   * Middleware verifyTaskPermission đã check quyền `ASSIGN_TASK` ở context board.
   */
  async assignTask(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const assignTaskDto = new AssignTaskRequestDto({
      ...(req.body as any),
      taskId,
    } as AssignTaskRequestDto);

    const actor = (req as any).user;
    const actorUserId: string | undefined = actor?.id;

    const result = await this.taskService.assignTask(assignTaskDto, actorUserId);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  /**
   * DELETE /task/:taskId/assign/:userId
   * Gỡ 1 member khỏi task.
   */
  async unassignTask(req: Request, res: Response): Promise<Response> {
    const taskId = req.params.taskId as string;
    const userId = req.params.userId as string;
    const unassignTaskDto = new UnassignTaskRequestDto({
      taskId,
      userId,
    } as UnassignTaskRequestDto);

    const result = await this.taskService.unassignTask(unassignTaskDto);
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  /**
   * PATCH /task/:taskId/status-action
   * Đổi trạng thái hành động hiện tại của task. Chỉ assignee mới được đổi
   * (service sẽ kiểm tra; middleware chỉ đảm bảo actor có quyền trong board).
   */
  async updateTaskStatusAction(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const taskId = req.params.taskId as string;
    const actor = (req as any).user;
    const actorUserId: string | undefined = actor?.id;

    const dto = new UpdateTaskStatusActionRequestDto({
      ...(req.body as any),
      taskId,
    } as UpdateTaskStatusActionRequestDto);

    const result = await this.taskService.updateTaskStatusAction(
      dto,
      actorUserId,
    );
    if (result instanceof Exception) {
      throw new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }
}