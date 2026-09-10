import { z } from "zod";

export class ProjectCountResponseDto {
  totalProjects: number;

  constructor(totalProjects: number) {
    this.totalProjects = totalProjects;
  }
}

export const projectCountResponseSchema = z.object({
  totalProjects: z.number().int().nonnegative(),
});
