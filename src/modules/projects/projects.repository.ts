import { projects } from "@/models";
import { Prisma, PrismaService } from "../data";
import { ProjectMemberStatus, ProjectStatus } from "@prisma/client";

// Fix 3 [P1] (Branch A): Include _count.board (soft-delete safe).
// Lưu ý: Trong schema Prisma, relation từ project tới board được đặt tên `board`
// (singular field) chứ không phải `boards` — xem prisma/schema.prisma dòng 273.
const boardCountInclude = {
  select: {
    board: { where: { deletedAt: null } },
  },
} as const;

const projectWithBoardCountInclude = {
  user: true,
  projectMembers: {
    where: {
      status: ProjectMemberStatus.ACTIVE,
      deletedAt: null,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  _count: boardCountInclude,
} as const;

type ProjectWithBoardCount = Prisma.projectsGetPayload<{
  include: typeof projectWithBoardCountInclude;
}>;

export class ProjectsRepository {
  constructor(private readonly prismaService = new PrismaService()) {}

  private getAccessibleProjectsWhere({
    userId,
    name,
    status,
  }: {
    userId: string;
    name?: string;
    status?: ProjectStatus;
  }): Prisma.projectsWhereInput {
    const whereCondition: Prisma.projectsWhereInput = {
      status,
      deletedAt: null,
      OR: [
        { userId },
        {
          projectMembers: {
            some: {
              userId,
              status: ProjectMemberStatus.ACTIVE,
              deletedAt: null,
            },
          },
        },
      ],
    };

    if (name) {
      whereCondition.AND = [
        {
          OR: [
            { name: { contains: name } },
            { description: { contains: name } },
          ],
        },
      ];
    }

    return whereCondition;
  }

  async createProject({
    project,
  }: {
    project: Prisma.projectsCreateInput;
  }): Promise<ProjectWithBoardCount> {
    return (this.prismaService.projects.create({
      include: projectWithBoardCountInclude,
      data: project,
    }) as unknown) as Promise<ProjectWithBoardCount>;
  }

  async getProjects({
    userId,
    name,
    status,
    skip,
    take,
  }: {
    userId: string;
    name?: string;
    status?: ProjectStatus;
    skip: number;
    take: number;
  }): Promise<[ProjectWithBoardCount[], number]> {
    const whereCondition = this.getAccessibleProjectsWhere({
      userId,
      name,
      status,
    });

    return Promise.all([
      (this.prismaService.projects.findMany({
        where: whereCondition,
        skip,
        take,
        include: projectWithBoardCountInclude,
        orderBy: {
          createdAt: "desc",
        },
      }) as unknown) as Promise<ProjectWithBoardCount[]>,
      this.prismaService.projects.count({
        where: whereCondition,
      }),
    ]);
  }

  async countProjects({
    userId,
    name,
    status,
  }: {
    userId: string;
    name?: string;
    status?: ProjectStatus;
  }): Promise<number> {
    return this.prismaService.projects.count({
      where: this.getAccessibleProjectsWhere({ userId, name, status }),
    });
  }

  async getProject({
    id,
    name,
    status,
    userId,
  }: {
    id?: string;
    name?: string;
    status?: ProjectStatus;
    userId?: string;
  }): Promise<ProjectWithBoardCount | null> {
    return (this.prismaService.projects.findFirst({
      where: {
        id,
        name,
        status,
        userId,
        deletedAt: { equals: null },
      },
      include: projectWithBoardCountInclude,
    }) as unknown) as Promise<ProjectWithBoardCount | null>;
  }

  async updateProject({
    id,
    project,
  }: {
    id: string;
    project: Prisma.projectsUpdateInput;
  }): Promise<ProjectWithBoardCount> {
    return (this.prismaService.projects.update({
      where: { id },
      data: project,
      include: projectWithBoardCountInclude,
    }) as unknown) as Promise<ProjectWithBoardCount>;
  }

  async deleteProject({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<projects> {
    return this.prismaService.projects.update({
      where: { id, userId },
      data: {
        deletedAt: new Date(),
        status: ProjectStatus.INACTIVE,
      },
    });
  }

  /**
   * Trả về danh sách `userId` có access ACTIVE tới project: owner + mọi project member
   * ACTIVE. Dùng cho realtime fan-out tới `user:{userId}` room trước khi mutate
   * project (đặc biệt với soft-delete, vì query sau delete sẽ không còn trả record).
   */
  async getActiveProjectMemberUserIds(projectId: string): Promise<string[]> {
    const [memberRows, project] = await Promise.all([
      this.prismaService.projectMembers.findMany({
        where: {
          projectId,
          status: ProjectMemberStatus.ACTIVE,
          deletedAt: null,
        },
        select: { userId: true },
      }),
      this.prismaService.projects.findFirst({
        where: { id: projectId, deletedAt: null },
        select: { userId: true },
      }),
    ]);
    const ids = new Set<string>();
    if (project?.userId) ids.add(project.userId);
    for (const row of memberRows) ids.add(row.userId);
    return Array.from(ids);
  }
}
