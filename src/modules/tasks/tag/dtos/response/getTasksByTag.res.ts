import z from "zod";
import {
  taskResponseSchema,
  TaskResponseDto,
} from "@/modules/tasks/dtos/response/task.res";
import {
  taskTagSummarySchema,
  TaskTagSummaryDto,
} from "./taskTagSummary.res";

export class GetTasksByTagResponseDto {
  tag: TaskTagSummaryDto;
  tasks: TaskResponseDto[];

  constructor(data: GetTasksByTagResponseDto) {
    this.tag = data.tag;
    this.tasks = data.tasks;
  }
}

export const getTasksByTagResponseSchema = z.object({
  tag: taskTagSummarySchema,
  tasks: z.array(taskResponseSchema),
});
