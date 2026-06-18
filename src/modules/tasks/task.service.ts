import { HttpResponseBodySuccessDto, NotFoundException } from "@/common";
import {
  CreateTaskRequestDto,
  GetAllTaskRequestDto,
  GetTaskByIdRequestDto,
  updateTaskRequestDto,
} from "./dtos/request";
import { TaskRepository } from "./task.repository";
import { TaskResponseDto } from "./dtos/response";
import { Exception } from "@tsed/exceptions";
import { Prisma } from "@prisma/client";

export class TaskService {
  constructor(private readonly taskRepository = new TaskRepository()) {}

  async createTask(
    createTaskDto: CreateTaskRequestDto,
  ): Promise<HttpResponseBodySuccessDto<TaskResponseDto> | Exception> {
    const data: Prisma.tasksCreateInput = {
      name: createTaskDto.name,
      description: createTaskDto.description ?? "",
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
}
