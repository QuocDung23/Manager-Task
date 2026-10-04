import { NotificationPriority, ProjectInvitationStatus } from "@prisma/client";
import { ClientException } from "@tsed/exceptions";
import { ConflictException, NotFoundException } from "@/common";
import { notificationInboxService } from "@/modules/notification";
import { realtimeEventService } from "@/modules/realtime/realtime-event.service";
import { ProjectInvitationResponseDto } from "./dtos/response/projectInvitation.res";
import { ProjectMemberResponseDto } from "./dtos/response/projectMember.res";
import { ProjectResponseDto } from "./dtos/response/project.res";
import { ProjectInvitationRepository } from "./project-invitation.repository";
import { ProjectsRepository } from "./projects.repository";

export class ProjectInvitationService {
  constructor(
    private readonly invitations = new ProjectInvitationRepository(),
    private readonly projects = new ProjectsRepository(),
  ) {}

  private publishChanged(invitation: ProjectInvitationResponseDto, actorId?: string | null): void {
    try {
      realtimeEventService.emitProjectInvitationChanged(invitation.inviteeId, invitation, actorId);
    } catch (error) {
      console.error("[invitation] event failed", { invitationId: invitation.id, error });
    }
  }

  private async expire(where: { inviteeId?: string; projectId?: string }): Promise<void> {
    const expired = await this.invitations.expire(where);
    for (const row of expired) this.publishChanged(new ProjectInvitationResponseDto(row));
  }

  async invite(projectId: string, inviteeId: string, invitedById: string) {
    await this.expire({ projectId });
    const row = await this.invitations.create(projectId, inviteeId, invitedById);
    const invitation = new ProjectInvitationResponseDto(row);
    try {
      await notificationInboxService.createForRecipients({
        recipientIds: [inviteeId],
        actorId: invitedById,
        type: "PROJECT_INVITATION_RECEIVED",
        priority: NotificationPriority.DIRECT,
        title: "Project invitation",
        body: `You were invited to join "${invitation.projectName}". Accept to get access.`,
        projectId,
        data: { invitationId: invitation.id, projectName: invitation.projectName },
        dedupeKey: (recipientId) => `project-invitation:${invitation.id}:${recipientId}`,
      });
    } catch (error) {
      console.error("[invitation] notification publish failed", { invitationId: invitation.id, error });
    }
    this.publishChanged(invitation, invitedById);
    return { success: true as const, data: invitation };
  }

  async listMine(inviteeId: string, status?: ProjectInvitationStatus) {
    await this.expire({ inviteeId });
    const rows = await this.invitations.listMine(inviteeId, status);
    return { success: true as const, data: rows.map((row) => new ProjectInvitationResponseDto(row)) };
  }

  async listProject(projectId: string, status?: ProjectInvitationStatus) {
    const project = await this.invitations.findActiveProject(projectId);
    if (!project) throw new NotFoundException("Project not found");
    await this.expire({ projectId });
    const rows = await this.invitations.listProject(projectId, status);
    return { success: true as const, data: rows.map((row) => new ProjectInvitationResponseDto(row)) };
  }

  async accept(invitationId: string, inviteeId: string) {
    await this.expire({ inviteeId });
    const result = await this.invitations.accept(invitationId, inviteeId);
    const member = new ProjectMemberResponseDto(result.member);
    const invitation = new ProjectInvitationResponseDto(result.invitation);
    try {
      const project = await this.projects.getProject({ id: member.projectId });
      if (project) {
        const recipients = await this.projects.getActiveProjectMemberUserIds(project.id);
        realtimeEventService.emitProjectMemberAdded({
          projectId: project.id,
          project: new ProjectResponseDto(project as any),
          member,
          actorId: inviteeId,
          recipientUserIds: recipients,
        });
      }
    } catch (error) {
      console.error("[invitation] accepted member event failed", { invitationId, error });
    }
    this.publishChanged(invitation, inviteeId);
    return { success: true as const, data: member };
  }

  async decline(invitationId: string, inviteeId: string) {
    await this.expire({ inviteeId });
    const row = await this.invitations.findForInvitee(invitationId, inviteeId);
    if (!row) throw new NotFoundException("Invitation not found");
    if (row.status === ProjectInvitationStatus.EXPIRED || row.status === ProjectInvitationStatus.REVOKED) {
      throw new ClientException(410, "Invitation no longer available");
    }
    if (row.status !== ProjectInvitationStatus.PENDING) throw new ConflictException("Invitation already handled");
    if (row.expiresAt <= new Date()) {
      await this.expire({ inviteeId });
      throw new ClientException(410, "Invitation no longer available");
    }
    const respondedAt = await this.invitations.changeStatus(invitationId, ProjectInvitationStatus.DECLINED, { inviteeId }, true);
    if (!respondedAt) throw new ConflictException("Invitation already handled");
    const invitation = new ProjectInvitationResponseDto({ ...row, status: ProjectInvitationStatus.DECLINED, respondedAt });
    this.publishChanged(invitation, inviteeId);
    return { success: true as const, data: invitation };
  }

  async revoke(projectId: string, invitationId: string, actorId: string) {
    await this.expire({ projectId });
    const row = await this.invitations.findForProject(projectId, invitationId);
    if (!row) throw new NotFoundException("Invitation not found");
    if (row.status === ProjectInvitationStatus.EXPIRED) throw new ClientException(410, "Invitation no longer available");
    const respondedAt = await this.invitations.changeStatus(invitationId, ProjectInvitationStatus.REVOKED, { projectId }, false);
    if (!respondedAt) throw new ConflictException("Invitation already handled");
    const invitation = new ProjectInvitationResponseDto({ ...row, status: ProjectInvitationStatus.REVOKED, respondedAt });
    this.publishChanged(invitation, actorId);
    return { success: true as const, data: invitation };
  }

  async revokePendingForProject(projectId: string, actorId: string): Promise<void> {
    const pending = await this.invitations.pendingForProject(projectId);
    for (const row of pending) {
      const respondedAt = await this.invitations.changeStatus(row.id, ProjectInvitationStatus.REVOKED, { projectId }, false);
      if (respondedAt) {
        this.publishChanged(new ProjectInvitationResponseDto({ ...row, status: ProjectInvitationStatus.REVOKED, respondedAt }), actorId);
      }
    }
  }
}
