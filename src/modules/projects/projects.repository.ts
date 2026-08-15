import { projects } from "@/models";
import { Prisma, PrismaService } from "../data";
import { ProjectMemberStatus, ProjectStatus } from "@prisma/client";

type ProjectCreateResult = Prisma.projectsGetPayload<{
  include: {
    user: true;
  };
}>;

type ProjectWithMembersResult = Prisma.projectsGetPayload<{
  include: {
    projectMembers: {
      include: {
        user: true;
      };
    };
  };
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
  }): Promise<ProjectCreateResult> {
    return this.prismaService.projects.create({
      include: {
        user: true,
      },
      data: project,
    });
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
  }): Promise<[ProjectWithMembersResult[], number]> {
    const whereCondition = this.getAccessibleProjectsWhere({
      userId,
      name,
      status,
    });

    return Promise.all([
      this.prismaService.projects.findMany({
        where: whereCondition,
        skip,
        take,
        include: {
          projectMembers: {
            where: {
              status: ProjectMemberStatus.ACTIVE,
              deletedAt: null,
            },
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
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
  }): Promise<ProjectWithMembersResult | null> {
    return this.prismaService.projects.findFirst({
      where: {
        id: id,
        name: name,
        status: status,
        userId: userId,
        deletedAt: { equals: null },
      },
      include: {
        projectMembers: {
          where: {
            status: ProjectMemberStatus.ACTIVE,
            deletedAt: null,
          },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  async updateProject({
    id,
    project,
  }: {
    id: string;
    project: Prisma.projectsUpdateInput;
  }): Promise<projects> {
    const { ...data } = project;
    return this.prismaService.projects.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  async deleteProject({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<projects> {
    return this.prismaService.projects.update({
      where: { id: id, userId: userId },
      data: {
        deletedAt: new Date(),
        status: ProjectStatus.INACTIVE,
      },
    });
  }
}
