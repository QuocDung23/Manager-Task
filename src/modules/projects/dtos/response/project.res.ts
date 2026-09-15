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

type RawProjectWithCount = {
  id: string;
  name: string;
  description: string;
  userId: string;
  projectMembers?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
  _count?: { board?: number };
  [key: string]: unknown;
};

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  role?: string;
  members?: ProjectMemberUserDto[];
  boardCount?: number;

  constructor(data: RawProjectWithCount) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.userId = data.userId;
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
    this.boardCount = data._count?.board ?? 0;
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
  // Fix 3 [P1] (Branch A): Thêm boardCount vào schema.
  boardCount: z.number().int().nonnegative().optional(),
});
