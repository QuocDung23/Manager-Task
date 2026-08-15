import {
  BoardMemberStatus,
  PermissionStatus,
  ProjectMemberStatus,
  RoleStatus,
} from "@prisma/client";
import { PrismaService } from "../data/prisma.client";
import { UserRole } from "@/common/enums/roles/user.role";

export class PermissionRepository {
  constructor(private readonly prismaService = new PrismaService()) {}

  private async isSuperAdmin(userId: string): Promise<boolean> {
    const checkSuperAdmin = await this.prismaService.userRoles.findFirst({
      where: {
        userId,
        role: {
          name: UserRole.SUPER_ADMIN,
          status: RoleStatus.ACTIVE,
        },
      },
    });
    return !!checkSuperAdmin;
  }

  private async checkSystemLevel(
    userId: string,
    permission: string[],
  ): Promise<boolean> {
    const checkSystem = await this.prismaService.rolePermissions.findFirst({
      where: {
        permission: {
          name: { in: permission },
          status: PermissionStatus.ACTIVE,
        },
        role: {
          status: RoleStatus.ACTIVE,
          userRoles: { some: { userId } },
        },
      },
    });
    return !!checkSystem;
  }

  private async checkScopedLevel(
    userId: string,
    permission: string[],
    scope: "project" | "board",
    scopeId: string,
  ): Promise<boolean> {
    const memberRelation =
      scope === "project"
        ? {
            projectMembers: {
              some: {
                userId,
                projectId: scopeId,
                status: ProjectMemberStatus.ACTIVE,
                deletedAt: null,
              },
            },
          }
        : {
            boardMembers: {
              some: {
                userId,
                boardId: scopeId,
                status: BoardMemberStatus.ACTIVE,
                deletedAt: null,
              },
            },
          };

    const check = await this.prismaService.rolePermissions.findFirst({
      where: {
        permission: {
          name: { in: permission },
          status: PermissionStatus.ACTIVE,
        },
        role: {
          status: RoleStatus.ACTIVE,
          ...memberRelation,
        },
      },
    });

    return !!check;
  }

  private async checkProjectLevel(
    userId: string,
    projectId: string,
    permission: string[],
  ): Promise<boolean> {
    return this.checkScopedLevel(userId, permission, "project", projectId);
  }

  private async checkBoardLevel(
    userId: string,
    boardId: string,
    permission: string[],
  ): Promise<boolean> {
    return this.checkScopedLevel(userId, permission, "board", boardId);
  }

  async checkAnyPermission(
    userId: string,
    permission: string[],
    context?: { projectId?: string; boardId?: string },
  ): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) return true;

    if (await this.checkSystemLevel(userId, permission)) return true;

    if (context?.projectId) {
      if (await this.checkProjectLevel(userId, context.projectId, permission)) {
        return true;
      }
    }

    if (context?.boardId) {
      if (await this.checkBoardLevel(userId, context.boardId, permission)) {
        return true;
      }
    }

    return false;
  }
}
