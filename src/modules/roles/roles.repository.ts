import { roles } from "@/models";
import { RoleStatus } from "@prisma/client";
import { PrismaService } from "../data";

export class RoleRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async findRolesName(roleName: string): Promise<roles | null> {
    return this.prisma.roles.findUnique({
      where: {
        name: roleName,
        status: RoleStatus.ACTIVE,
      },
    });
  }

  async findRoleById(roleId: string): Promise<roles | null> {
    return this.prisma.roles.findFirst({
      where: {
        id: roleId,
        status: RoleStatus.ACTIVE,
      },
    });
  }
}
