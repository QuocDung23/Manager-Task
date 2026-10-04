import { Prisma, ProjectInvitationStatus } from "@prisma/client";
import { z } from "zod";

export const projectInvitationInclude = {
  project: { select: { id: true, name: true, status: true, deletedAt: true } },
  invitee: { select: { id: true, name: true, email: true } },
  invitedBy: { select: { id: true, name: true } },
  role: { select: { id: true, name: true } },
} satisfies Prisma.projectInvitationsInclude;

export type ProjectInvitationWithDetails = Prisma.projectInvitationsGetPayload<{
  include: typeof projectInvitationInclude;
}>;

export class ProjectInvitationResponseDto {
  id: string;
  projectId: string;
  projectName: string;
  inviteeId: string;
  inviteeName: string;
  inviteeEmail: string;
  invitedById: string;
  invitedByName: string;
  role: string;
  status: ProjectInvitationStatus;
  expiresAt: Date;
  respondedAt: Date | null;
  createdAt: Date;

  constructor(row: ProjectInvitationWithDetails) {
    this.id = row.id;
    this.projectId = row.projectId;
    this.projectName = row.project.name;
    this.inviteeId = row.inviteeId;
    this.inviteeName = row.invitee.name;
    this.inviteeEmail = row.invitee.email;
    this.invitedById = row.invitedById;
    this.invitedByName = row.invitedBy.name;
    this.role = row.role.name;
    this.status = row.status;
    this.expiresAt = row.expiresAt;
    this.respondedAt = row.respondedAt;
    this.createdAt = row.createdAt;
  }
}

export const projectInvitationResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  projectName: z.string(),
  inviteeId: z.string().uuid(),
  inviteeName: z.string(),
  inviteeEmail: z.string().email(),
  invitedById: z.string().uuid(),
  invitedByName: z.string(),
  role: z.string(),
  status: z.enum(ProjectInvitationStatus),
  expiresAt: z.date(),
  respondedAt: z.date().nullable(),
  createdAt: z.date(),
});
