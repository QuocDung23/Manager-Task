import { projectMembers } from "@/models";
import { PrismaService } from "../data";

export class ProjectMemberRepo {
  constructor(private readonly prisma = new PrismaService()) {}

  async findProjectMember(
    userId: string,
    projectId: string,
  ): Promise<projectMembers | null> {
    return this.prisma.projectMembers.findFirst({
      where: {
        userId,
        projectId,
        deletedAt: null,
      },
    });
  }

  async assignUserRoleProject(
    userId: string,
    projectId: string,
    roleId: string,
  ) {
    return this.prisma.projectMembers.create({
      data: {
        projectId,
        userId,
        roleId,
      },
    });
  }

  async addMemberToProject(
    userId: string,
    projectId: string,
    roleId: string,
  ): Promise<projectMembers> {
    return this.prisma.projectMembers.create({
      data: {
        userId,
        projectId,
        roleId,
      },
    });
  }

  async checkMemberOfProject(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const isMember = await this.prisma.projectMembers.findFirst({
      where: {
        projectId,
        userId,
      },
      select: { id: true },
    });
    return !!isMember;
  }
}
