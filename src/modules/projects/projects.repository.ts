import { projects, projectsPartialWithRelations } from "@/models";
import { Prisma, PrismaService } from "../data";
import { ProjectStatus } from "@prisma/client";

export class ProjectsRepository {
  constructor(private readonly prismaService = new PrismaService()) {}

  async createProject({
    project,
  }: {
    project: Prisma.projectsCreateInput;
  }): Promise<projectsPartialWithRelations> {
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
  }): Promise<[projects[], number]> {
    const whereCondition: Prisma.projectsWhereInput = {
      userId,
      status,
      deletedAt: { equals: null },
    };
    if (name) {
      whereCondition.OR = [
        { name: { contains: name } },
        { description: { contains: name } }
      ];
    }

    return Promise.all([
      this.prismaService.projects.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prismaService.projects.count({
        where: whereCondition,
      }),
    ]);
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
  }): Promise<projects | null> {
    return this.prismaService.projects.findFirst({
      where: {
        id: id,
        name: name,
        status: status,
        userId: userId,
        deletedAt: { equals: null },
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
