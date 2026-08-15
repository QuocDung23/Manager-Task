import {
  BoardMemberStatus,
  Prisma,
  ProjectMemberStatus,
  projectMembers,
} from "@prisma/client";
import { PrismaService } from "../data";

const projectMemberDetailsSelect = {
  id: true,
  userId: true,
  projectId: true,
  roleId: true,
  status: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.projectMembersSelect;

export type ProjectMemberWithDetails = Prisma.projectMembersGetPayload<{
  select: typeof projectMemberDetailsSelect;
}>;

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
        status: ProjectMemberStatus.ACTIVE,
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
  ): Promise<ProjectMemberWithDetails> {
    return this.prisma.projectMembers.create({
      data: {
        userId,
        projectId,
        roleId,
      },
      select: projectMemberDetailsSelect,
    });
  }

  async getProjectMembers(
    projectId: string,
  ): Promise<ProjectMemberWithDetails[]> {
    return this.prisma.projectMembers.findMany({
      where: {
        projectId,
        status: ProjectMemberStatus.ACTIVE,
        deletedAt: null,
      },
      select: projectMemberDetailsSelect,
      orderBy: { createdAt: "asc" },
    });
  }

  async getProjectMemberById(
    projectId: string,
    memberId: string,
  ): Promise<ProjectMemberWithDetails | null> {
    return this.prisma.projectMembers.findFirst({
      where: {
        id: memberId,
        projectId,
        status: ProjectMemberStatus.ACTIVE,
        deletedAt: null,
      },
      select: projectMemberDetailsSelect,
    });
  }

  async updateProjectMemberRole(
    projectId: string,
    memberId: string,
    roleId: string,
  ): Promise<ProjectMemberWithDetails> {
    return this.prisma.projectMembers.update({
      where: {
        id: memberId,
        projectId,
        status: ProjectMemberStatus.ACTIVE,
        deletedAt: null,
      },
      data: { roleId },
      select: projectMemberDetailsSelect,
    });
  }

  async removeProjectMember(
    projectId: string,
    memberId: string,
    userId: string,
  ): Promise<ProjectMemberWithDetails> {
    const deletedAt = new Date();

    return this.prisma.$transaction(async (transaction) => {
      const member = await transaction.projectMembers.update({
        where: {
          id: memberId,
          projectId,
          status: ProjectMemberStatus.ACTIVE,
          deletedAt: null,
        },
        data: {
          status: ProjectMemberStatus.INACTIVE,
          deletedAt,
        },
        select: projectMemberDetailsSelect,
      });

      await transaction.boardMembers.updateMany({
        where: {
          userId,
          status: BoardMemberStatus.ACTIVE,
          deletedAt: null,
          board: { projectId },
        },
        data: {
          status: BoardMemberStatus.INACTIVE,
          deletedAt,
        },
      });

      return member;
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
        status: ProjectMemberStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    return !!isMember;
  }
}
