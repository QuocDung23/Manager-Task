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
}
