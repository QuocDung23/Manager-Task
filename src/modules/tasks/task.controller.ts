import { Exception } from "@tsed/exceptions";
import {
  CreateTaskRequestDto,
  GetAllTaskRequestDto,
  GetTaskByIdRequestDto,
  updateTaskRequestDto,
} from "./dtos/request";
import { TaskService } from "./task.service";
import { Request, Response } from "express";
import { HttpResponseDto } from "@/common";

export class TaskController {
  constructor(private readonly taskService = new TaskService()) {}

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
}
