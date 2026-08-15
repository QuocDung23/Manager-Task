import { ProjectMemberStatus } from "@prisma/client";
import z from "zod";

export class ProjectMemberResponseDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  projectId: string;
  roleId: string;
  role: string;
  status: ProjectMemberStatus;
  createdAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    projectId: string;
    roleId: string;
    status: ProjectMemberStatus;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
    role: { id: string; name: string };
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.user.name;
    this.email = data.user.email;
    this.avatar = data.user.avatar;
    this.projectId = data.projectId;
    this.roleId = data.roleId;
    this.role = data.role.name;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}

export const projectMemberResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable(),
  projectId: z.string().uuid(),
  roleId: z.string().uuid(),
  role: z.string(),
  status: z.enum(ProjectMemberStatus),
  createdAt: z.date(),
});

export class ProjectMembersResponseDto {
  members: ProjectMemberResponseDto[];
  totalMembers: number;

  constructor(members: ProjectMemberResponseDto[]) {
    this.members = members;
    this.totalMembers = members.length;
  }
}

export const projectMembersResponseSchema = z.object({
  members: z.array(projectMemberResponseSchema),
  totalMembers: z.number().int().nonnegative(),
});
