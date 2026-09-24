import z from "zod";

export class TaskTagSummaryDto {
  id: string;
  name: string;
  color: string;

  constructor(data: TaskTagSummaryDto) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
  }
}

export const taskTagSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string(),
});
