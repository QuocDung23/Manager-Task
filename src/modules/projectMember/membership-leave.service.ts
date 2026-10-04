import { NotificationPriority } from "@prisma/client";
import { BoardPermissions, ProjectPermissions } from "@/common/enums/permissions";
import { BoardMemberResponseDto } from "@/modules/board/dtos/responses/boardMember.res";
import { notificationInboxService } from "@/modules/notification";
import { PermissionRepository } from "@/modules/permission/permission.repository";
import { ProjectMemberResponseDto } from "@/modules/projects/dtos/response/projectMember.res";
import { realtimeEventService } from "@/modules/realtime/realtime-event.service";
import { TaskResponseDto } from "@/modules/tasks/dtos/response";
import { TaskRepository } from "@/modules/tasks/task.repository";
import { MembershipLeaveRepository } from "./membership-leave.repository";

type RemovedTask = { taskId: string; boardId: string };

export class MembershipLeaveService {
  constructor(
    private readonly members = new MembershipLeaveRepository(),
    private readonly permissions = new PermissionRepository(),
    private readonly tasks = new TaskRepository(),
  ) {}

  private async canView(
    userId: string,
    permission: ProjectPermissions | BoardPermissions,
    context: { projectId?: string; boardId?: string },
  ): Promise<boolean> {
    try {
      return await this.permissions.checkAnyPermission(userId, [permission], context);
    } catch (error) {
      console.error("[membership] permission recheck failed; revoking scoped room", { userId, context, error });
      return false;
    }
  }

  private async publishTasks(affected: RemovedTask[], actorId: string): Promise<void> {
    for (const { taskId, boardId } of affected) {
      try {
        const task = await this.tasks.getTaskByIdWithAssignments(taskId);
        if (task) {
          realtimeEventService.emitTaskAssignmentsUpdated({
            boardId,
            taskId,
            task: new TaskResponseDto(task as any),
            actorId,
          });
        }
      } catch (error) {
        console.error("[membership] task assignment event failed", { taskId, error });
      }
    }
  }

  async leaveProject(projectId: string, userId: string) {
    return this.removeProjectMembership(projectId, userId, userId);
  }

  async removeProjectMember(projectId: string, memberId: string, actorId: string) {
    return this.removeProjectMembership(projectId, undefined, actorId, memberId);
  }

  private async removeProjectMembership(projectId: string, userId: string | undefined, actorId: string, memberId?: string) {
    const result = await this.members.removeProjectMembership(projectId, userId, memberId);
    const member = new ProjectMemberResponseDto(result.member);
    try {
      realtimeEventService.emitProjectMemberRemoved({
        projectId,
        memberId: member.id,
        userId: result.userId,
        actorId,
      });
      for (const boardMember of result.boardMembers) {
        realtimeEventService.emitBoardMemberRemoved({
          projectId,
          boardId: boardMember.boardId,
          memberId: boardMember.id,
          userId: result.userId,
          actorId,
        });
      }
      await this.publishTasks(result.affected, actorId);
      const canViewProject = await this.canView(result.userId, ProjectPermissions.VIEW_PROJECT, { projectId });
      const revokedBoardIds: string[] = [];
      for (const boardId of result.boardIds) {
        if (!await this.canView(result.userId, BoardPermissions.VIEW_BOARD, { projectId, boardId })) {
          revokedBoardIds.push(boardId);
        }
      }
      realtimeEventService.revokeScopedRooms(
        result.userId,
        canViewProject ? undefined : projectId,
        revokedBoardIds,
        result.tasks.filter((task) => revokedBoardIds.includes(task.boardId)).map((task) => task.id),
      );
    } catch (error) {
      console.error("[membership] project removal event failed", { projectId, userId: result.userId, error });
    }
    try {
      if (memberId) {
        await notificationInboxService.createForRecipients({
          recipientIds: [result.userId],
          actorId,
          type: "MEMBER_REMOVED",
          priority: NotificationPriority.DIRECT,
          title: "You were removed from a project",
          body: `You no longer have access to "${result.projectName}".`,
          projectId,
          data: { projectName: result.projectName },
          dedupeKey: (recipientId) => `project:${projectId}:removed:${member.id}:${recipientId}`,
        });
      } else {
        const adminIds = await this.members.getProjectAdminIds(projectId);
        await notificationInboxService.createForRecipients({
          recipientIds: adminIds,
          actorId,
          type: "PROJECT_MEMBER_LEFT",
          priority: NotificationPriority.DIRECT,
          title: "A member left the project",
          body: `${member.name} left "${result.projectName}".`,
          projectId,
          data: { userId: result.userId, memberId: member.id },
          dedupeKey: (recipientId) => `project:${projectId}:left:${member.id}:${recipientId}`,
        });
      }
    } catch (error) {
      console.error("[membership] project removal notification failed", { projectId, userId: result.userId, error });
    }
    return { success: true as const, data: member };
  }

  async leaveBoard(boardId: string, userId: string) {
    const result = await this.members.leaveBoard(boardId, userId);
    const member = new BoardMemberResponseDto(result.member);
    try {
      realtimeEventService.emitBoardMemberRemoved({
        projectId: result.projectId,
        boardId,
        memberId: member.boardMemberId,
        userId,
        actorId: userId,
      });
      await this.publishTasks(result.affected, userId);
      if (!await this.canView(userId, BoardPermissions.VIEW_BOARD, { boardId, projectId: result.projectId })) {
        realtimeEventService.revokeScopedRooms(userId, undefined, [boardId], result.taskIds);
      }
    } catch (error) {
      console.error("[membership] board leave event failed", { boardId, userId, error });
    }
    try {
      const adminIds = await this.members.getBoardAdminIds(boardId);
      await notificationInboxService.createForRecipients({
        recipientIds: adminIds,
        actorId: userId,
        type: "BOARD_MEMBER_LEFT",
        priority: NotificationPriority.DIRECT,
        title: "A member left the board",
        body: `${member.name} left "${result.boardName}".`,
        projectId: result.projectId,
        boardId,
        data: { userId, memberId: member.boardMemberId },
        dedupeKey: (recipientId) => `board:${boardId}:left:${member.boardMemberId}:${recipientId}`,
      });
    } catch (error) {
      console.error("[membership] board leave notification failed", { boardId, userId, error });
    }
    return { success: true as const, data: member };
  }
}
