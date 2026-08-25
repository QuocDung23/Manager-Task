import z from "zod";

export class ProjectMemberUserDto {
  id: string;
  name: string;
  email: string;
  avatar: string | null;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.avatar = data.avatar;
  }
}

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  role?: string;
  members?: ProjectMemberUserDto[];

  constructor(data: {
    id: string;
    name: string;
    description: string;
    userId: string;
    role?: string;
    projectMembers?: Array<{
      user: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
      };
    }>;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
    this.role = data.role;
    if (data.projectMembers) {
      this.members = data.projectMembers.map(
        (pm) =>
          new ProjectMemberUserDto({
            id: pm.user.id,
            name: pm.user.name,
            email: pm.user.email,
            avatar: pm.user.avatar,
          }),
      );
    }
  }
}

export const projectMemberUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
});

export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  userId: z.string(),
  role: z.string().optional(),
  members: z.array(projectMemberUserSchema).optional(),
});