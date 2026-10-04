import {
  Prisma,
  ProjectInvitationStatus,
  ProjectMemberStatus,
  ProjectStatus,
  RoleStatus,
  UserStatus,
} from "@prisma/client";
import { ClientException } from "@tsed/exceptions";
import { ConflictException, NotFoundException } from "@/common";
import { PrismaService } from "@/modules/data/prisma.client";
import {
  projectInvitationInclude,
  ProjectInvitationWithDetails,
} from "./dtos/response/projectInvitation.res";

const activeProject = { status: ProjectStatus.ACTIVE, deletedAt: null } as const;
const activeMember = { status: ProjectMemberStatus.ACTIVE, deletedAt: null } as const;

function handleUniqueConflict(error: unknown, message: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new ConflictException(message);
  }
  throw error;
}

export class ProjectInvitationRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  async expire(where: { inviteeId?: string; projectId?: string }): Promise<ProjectInvitationWithDetails[]> {
    const rows = await this.prisma.projectInvitations.findMany({
      where: { ...where, status: ProjectInvitationStatus.PENDING, expiresAt: { lte: new Date() } },
      include: projectInvitationInclude,
    });
    const changedRows: ProjectInvitationWithDetails[] = [];
    for (const row of rows) {
      const respondedAt = new Date();
      const changed = await this.prisma.projectInvitations.updateMany({
        where: { id: row.id, status: ProjectInvitationStatus.PENDING, expiresAt: { lte: respondedAt } },
        data: { status: ProjectInvitationStatus.EXPIRED, respondedAt },
      });
      if (changed.count === 1) changedRows.push({ ...row, status: ProjectInvitationStatus.EXPIRED, respondedAt });
    }
    return changedRows;
  }

  async create(projectId: string, inviteeId: string, invitedById: string): Promise<ProjectInvitationWithDetails> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "projects" WHERE "id" = ${projectId} FOR UPDATE`;
        const [project, invitee, member, pending, role] = await Promise.all([
          tx.projects.findFirst({ where: { id: projectId, ...activeProject } }),
          tx.users.findFirst({ where: { id: inviteeId, status: UserStatus.ACTIVE, verify: true, deletedAt: null } }),
          tx.projectMembers.findFirst({ where: { projectId, userId: inviteeId, ...activeMember } }),
          tx.projectInvitations.findFirst({ where: { projectId, inviteeId, status: ProjectInvitationStatus.PENDING } }),
          tx.roles.findFirst({ where: { name: "PROJECT_MEMBER", status: RoleStatus.ACTIVE } }),
        ]);
        if (!project || !invitee) throw new NotFoundException("Project or user not found");
        if (!role) throw new NotFoundException("Project member role not found");
        if (project.userId === inviteeId || member) throw new ConflictException("User already in project");
        if (pending) throw new ConflictException("Invitation already pending");
        return tx.projectInvitations.create({
          data: {
            projectId, inviteeId, invitedById, roleId: role.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          include: projectInvitationInclude,
        });
      });
    } catch (error) {
      handleUniqueConflict(error, "Invitation already pending");
    }
  }

  listMine(inviteeId: string, status?: ProjectInvitationStatus) {
    return this.prisma.projectInvitations.findMany({
      where: { inviteeId, ...(status ? { status } : {}), project: activeProject },
      include: projectInvitationInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  listProject(projectId: string, status?: ProjectInvitationStatus) {
    return this.prisma.projectInvitations.findMany({
      where: { projectId, ...(status ? { status } : {}) },
      include: projectInvitationInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  findActiveProject(projectId: string) {
    return this.prisma.projects.findFirst({ where: { id: projectId, ...activeProject }, select: { id: true } });
  }

  findForInvitee(invitationId: string, inviteeId: string) {
    return this.prisma.projectInvitations.findFirst({
      where: { id: invitationId, inviteeId }, include: projectInvitationInclude,
    });
  }

  findForProject(projectId: string, invitationId: string) {
    return this.prisma.projectInvitations.findFirst({
      where: { id: invitationId, projectId }, include: projectInvitationInclude,
    });
  }

  async accept(invitationId: string, inviteeId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const target = await tx.projectInvitations.findFirst({
          where: { id: invitationId, inviteeId }, select: { projectId: true },
        });
        if (!target) throw new NotFoundException("Invitation not found");
        await tx.$queryRaw`SELECT "id" FROM "projects" WHERE "id" = ${target.projectId} FOR UPDATE`;
        const invitation = await tx.projectInvitations.findFirst({
          where: { id: invitationId, inviteeId }, include: projectInvitationInclude,
        });
        if (!invitation) throw new NotFoundException("Invitation not found");
        if (invitation.status === ProjectInvitationStatus.EXPIRED || invitation.status === ProjectInvitationStatus.REVOKED) {
          throw new ClientException(410, "Invitation no longer available");
        }
        if (invitation.status !== ProjectInvitationStatus.PENDING) throw new ConflictException("Invitation already handled");
        if (invitation.expiresAt <= new Date()) throw new ClientException(410, "Invitation no longer available");
        if (invitation.project.status !== ProjectStatus.ACTIVE || invitation.project.deletedAt) throw new NotFoundException("Project not found");
        const invitee = await tx.users.findFirst({ where: { id: inviteeId, status: UserStatus.ACTIVE, verify: true, deletedAt: null } });
        if (!invitee) throw new NotFoundException("User not found");
        const role = await tx.roles.findFirst({ where: { id: invitation.roleId, status: RoleStatus.ACTIVE, name: "PROJECT_MEMBER" }, select: { id: true } });
        if (!role) throw new ConflictException("Invitation role no longer available");
        const respondedAt = new Date();
        const claimed = await tx.projectInvitations.updateMany({
          where: { id: invitationId, inviteeId, status: ProjectInvitationStatus.PENDING, expiresAt: { gt: respondedAt } },
          data: { status: ProjectInvitationStatus.ACCEPTED, respondedAt },
        });
        if (claimed.count !== 1) throw new ConflictException("Invitation already handled");
        const member = await tx.projectMembers.create({
          data: { projectId: invitation.projectId, userId: inviteeId, roleId: invitation.roleId },
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            role: { select: { id: true, name: true } },
          },
        });
        return { member, invitation: { ...invitation, status: ProjectInvitationStatus.ACCEPTED, respondedAt } };
      });
    } catch (error) {
      handleUniqueConflict(error, "User already in project");
    }
  }

  async changeStatus(
    invitationId: string,
    status: "DECLINED" | "REVOKED",
    scope: { inviteeId?: string; projectId?: string },
    requireUnexpired: boolean,
  ) {
    const respondedAt = new Date();
    const changed = await this.prisma.projectInvitations.updateMany({
      where: {
        id: invitationId, ...scope, status: ProjectInvitationStatus.PENDING,
        ...(requireUnexpired ? { expiresAt: { gt: respondedAt } } : {}),
      },
      data: { status, respondedAt },
    });
    return changed.count === 1 ? respondedAt : null;
  }

  pendingForProject(projectId: string) {
    return this.prisma.projectInvitations.findMany({
      where: { projectId, status: ProjectInvitationStatus.PENDING },
      include: projectInvitationInclude,
    });
  }
}
