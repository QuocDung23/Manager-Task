import z from "zod";

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  userId: string;

  constructor(data: ProjectResponseDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
  }
}

export const ProjectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  userId: z.string(),
});
