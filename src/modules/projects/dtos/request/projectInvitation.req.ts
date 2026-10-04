import { ProjectInvitationStatus } from "@prisma/client";
import { ZodValidationSchema } from "@/common";
import { z } from "zod";

export class CreateProjectInvitationRequestDto {
  userId: string;

  constructor(data: CreateProjectInvitationRequestDto) {
    this.userId = data.userId;
  }
}

export const projectInvitationIdParams = z.object({
  invitationId: z.string().uuid(),
}).strict();

export const projectInvitationProjectParams = z.object({
  projectId: z.string().uuid(),
}).strict();

export const projectInvitationProjectIdParams = z.object({
  projectId: z.string().uuid(),
  invitationId: z.string().uuid(),
}).strict();

export const createProjectInvitationBody = z.object({
  userId: z.string().uuid(),
}).strict();

export const projectInvitationQuery = z.object({
  status: z.enum(ProjectInvitationStatus).optional(),
}).strict();

export const createProjectInvitationValidationSchema: ZodValidationSchema = {
  params: projectInvitationProjectParams,
  body: createProjectInvitationBody,
};

export const createProjectInvitationRequestSchema = {
  params: projectInvitationProjectParams,
  body: {
    description: "Send a project invitation; access starts after acceptance",
    content: { "application/json": { schema: createProjectInvitationBody } },
  },
};

export const getMyProjectInvitationsValidationSchema: ZodValidationSchema = {
  query: projectInvitationQuery,
};

export const getMyProjectInvitationsRequestSchema = {
  query: projectInvitationQuery,
};

export const projectInvitationActionValidationSchema: ZodValidationSchema = {
  params: projectInvitationIdParams,
};

export const projectInvitationActionRequestSchema = {
  params: projectInvitationIdParams,
};

export const getProjectInvitationsValidationSchema: ZodValidationSchema = {
  params: projectInvitationProjectParams,
  query: projectInvitationQuery,
};

export const getProjectInvitationsRequestSchema = {
  params: projectInvitationProjectParams,
  query: projectInvitationQuery,
};

export const revokeProjectInvitationValidationSchema: ZodValidationSchema = {
  params: projectInvitationProjectIdParams,
};

export const revokeProjectInvitationRequestSchema = {
  params: projectInvitationProjectIdParams,
};

export const leaveProjectValidationSchema: ZodValidationSchema = {
  params: projectInvitationProjectParams,
};

export const leaveProjectRequestSchema = {
  params: projectInvitationProjectParams,
};
