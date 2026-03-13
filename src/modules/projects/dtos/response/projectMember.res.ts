import z from "zod";

export class ProjectMemberResponseDto {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  status: string;
  createdAt: Date;

  constructor(data: ProjectMemberResponseDto) {
    this.id = data.id;
    this.userId = data.userId;
    this.projectId = data.projectId;
    this.roleId = data.roleId;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}

export const projectMemberResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  roleId: z.string().uuid(),
  status: z.string(),
  createdAt: z.date(),
});
