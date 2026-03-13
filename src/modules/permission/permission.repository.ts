import { RoleStatus, PermissionStatus } from "@prisma/client";
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

  private async checkSystemLeve(
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

  private async checkProjectLeve(
    userId: string,
    projectId: string,
    permission: string[],
  ): Promise<boolean> {
    const checkProject = await this.prismaService.rolePermissions.findFirst({
      where: {
        permission: {
          name: { in: permission },
          status: PermissionStatus.ACTIVE,
        },
        role: {
          status: RoleStatus.ACTIVE,
          projectMembers: { some: { userId, projectId } },
        },
      },
    });
    return !!checkProject;
  }

  async checkAnyPermission(
    userId: string,
    permission: string[],
    context?: { projectId: string },
  ): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) return true;

    if (await this.checkSystemLeve(userId, permission)) return true;

    if (context?.projectId) {
      if (await this.checkProjectLeve(userId, context?.projectId, permission))
        return true;
    }

    return false;
  }
}
