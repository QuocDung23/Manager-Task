import {
  BoardMemberStatus,
  BoardStatus,
  Prisma,
  ProjectMemberStatus,
  ProjectStatus,
} from "@prisma/client";
import { ConflictException, ForbiddenException, NotFoundException } from "@/common";
import { PrismaService } from "@/modules/data/prisma.client";

const projectMemberInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
  role: { select: { id: true, name: true } },
} satisfies Prisma.projectMembersInclude;

const boardMemberInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
  role: { select: { id: true, name: true } },
} satisfies Prisma.boardMembersInclude;

type RemovedTask = { taskId: string; boardId: string };

export class MembershipLeaveRepository {
  constructor(private readonly prisma = new PrismaService()) {}

  private async cleanupAssignments(
    tx: Prisma.TransactionClient,
    userId: string,
    boardIds: string[],
    now: Date,
  ): Promise<RemovedTask[]> {
    if (boardIds.length === 0) return [];
    const assignments = await tx.taskAssignments.findMany({
      where: { userId, deletedAt: null, task: { list: { boardId: { in: boardIds } } } },
      select: { id: true, taskId: true, task: { select: { list: { select: { boardId: true } } } } },
    });
    if (assignments.length === 0) return [];
    await tx.taskAssignments.updateMany({
      where: { id: { in: assignments.map((item) => item.id) }, deletedAt: null },
      data: { deletedAt: now },
    });
    const affected = new Map<string, string>();
    for (const assignment of assignments) affected.set(assignment.taskId, assignment.task.list.boardId);
    for (const taskId of affected.keys()) {
      await tx.tasks.update({ where: { id: taskId }, data: { assignmentVersion: { increment: 1 } } });
    }
    return [...affected].map(([taskId, boardId]) => ({ taskId, boardId }));
  }

  async removeProjectMembership(projectId: string, userId?: string, memberId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.projects.findFirst({
        where: { id: projectId, status: ProjectStatus.ACTIVE, deletedAt: null },
      });
      if (!project) throw new NotFoundException("Project not found");
      const membership = await tx.projectMembers.findFirst({
        where: { projectId, ...(memberId ? { id: memberId } : { userId }), status: ProjectMemberStatus.ACTIVE, deletedAt: null },
        include: projectMemberInclude,
      });
      if (!membership) throw new NotFoundException("Project member not found");
      const removedUserId = membership.userId;
      if (project.userId === removedUserId) throw new ForbiddenException("Project owner cannot leave");
      const ownedBoard = await tx.boards.findFirst({
        where: { projectId, userId: removedUserId, status: BoardStatus.ACTIVE, deletedAt: null },
        select: { id: true },
      });
      if (ownedBoard) throw new ConflictException("Delete or transfer owned boards before leaving project");
      const now = new Date();
      const changed = await tx.projectMembers.updateMany({
        where: { id: membership.id, status: ProjectMemberStatus.ACTIVE, deletedAt: null },
        data: { status: ProjectMemberStatus.INACTIVE, deletedAt: now },
      });
      if (changed.count !== 1) throw new ConflictException("Project member already removed");
      const boards = await tx.boards.findMany({
        where: { projectId, status: BoardStatus.ACTIVE, deletedAt: null }, select: { id: true },
      });
      const boardIds = boards.map((board) => board.id);
      const boardMembers = await tx.boardMembers.findMany({
        where: { userId: removedUserId, boardId: { in: boardIds }, status: BoardMemberStatus.ACTIVE, deletedAt: null },
        select: { id: true, boardId: true },
      });
      await tx.boardMembers.updateMany({
        where: { id: { in: boardMembers.map((member) => member.id) } },
        data: { status: BoardMemberStatus.INACTIVE, deletedAt: now },
      });
      const affected = await this.cleanupAssignments(tx, removedUserId, boardIds, now);
      const allTasks = await tx.tasks.findMany({
        where: { list: { boardId: { in: boardIds } } },
        select: { id: true, list: { select: { boardId: true } } },
      });
      return {
        member: { ...membership, status: ProjectMemberStatus.INACTIVE },
        userId: removedUserId,
        boardMembers,
        boardIds,
        tasks: allTasks.map((task) => ({ id: task.id, boardId: task.list.boardId })),
        affected,
        projectName: project.name,
      };
    });
  }

  async leaveBoard(boardId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.boards.findFirst({
        where: { id: boardId, status: BoardStatus.ACTIVE, deletedAt: null },
      });
      if (!board) throw new NotFoundException("Board not found");
      const membership = await tx.boardMembers.findFirst({
        where: { boardId, userId, status: BoardMemberStatus.ACTIVE, deletedAt: null },
        include: boardMemberInclude,
      });
      if (!membership) throw new NotFoundException("Board member not found");
      if (board.userId === userId) throw new ForbiddenException("Board owner cannot leave");
      const now = new Date();
      const changed = await tx.boardMembers.updateMany({
        where: { id: membership.id, status: BoardMemberStatus.ACTIVE, deletedAt: null },
        data: { status: BoardMemberStatus.INACTIVE, deletedAt: now },
      });
      if (changed.count !== 1) throw new ConflictException("Board member already removed");
      const affected = await this.cleanupAssignments(tx, userId, [boardId], now);
      const allTasks = await tx.tasks.findMany({ where: { list: { boardId } }, select: { id: true } });
      return {
        member: { ...membership, status: BoardMemberStatus.INACTIVE },
        projectId: board.projectId,
        boardName: board.name,
        taskIds: allTasks.map((task) => task.id),
        affected,
      };
    });
  }

  async getProjectAdminIds(projectId: string): Promise<string[]> {
    const admins = await this.prisma.projectMembers.findMany({
      where: { projectId, status: ProjectMemberStatus.ACTIVE, deletedAt: null, role: { name: "PROJECT_ADMIN" } },
      select: { userId: true },
    });
    return admins.map((admin) => admin.userId);
  }

  async getBoardAdminIds(boardId: string): Promise<string[]> {
    const admins = await this.prisma.boardMembers.findMany({
      where: { boardId, status: BoardMemberStatus.ACTIVE, deletedAt: null, role: { name: "BOARD_ADMIN" } },
      select: { userId: true },
    });
    return admins.map((admin) => admin.userId);
  }
}
