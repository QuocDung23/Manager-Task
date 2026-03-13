import z from "zod";
import { da } from "zod/v4/locales";

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  role?: string

  constructor(data: ProjectResponseDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
    this.role = data.role
  }
}

export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  userId: z.string(),
  role: z.string().optional()
});
