import { ProjectInvitationStatus } from "@prisma/client";
import { Exception } from "@tsed/exceptions";
import { Request, Response } from "express";
import { HttpResponseDto } from "@/common";
import { CreateProjectInvitationRequestDto } from "./dtos/request/projectInvitation.req";
import { ProjectInvitationService } from "./project-invitation.service";

export class ProjectInvitationController {
  constructor(private readonly invitationService = new ProjectInvitationService()) {}

  async invite(req: Request, res: Response): Promise<Response> {
    const dto = new CreateProjectInvitationRequestDto(req.body as CreateProjectInvitationRequestDto);
    const result = await this.invitationService.invite(req.params.projectId as string, dto.userId, (req as any).user.id);
    if (result instanceof Exception) return new HttpResponseDto().exception(res, result);
    return new HttpResponseDto().created(res, result);
  }

  async listMine(req: Request, res: Response): Promise<Response> {
    const result = await this.invitationService.listMine((req as any).user.id, req.query.status as ProjectInvitationStatus | undefined);
    if (result instanceof Exception) return new HttpResponseDto().exception(res, result);
    return new HttpResponseDto().success(res, result);
  }

  async listProject(req: Request, res: Response): Promise<Response> {
    const result = await this.invitationService.listProject(req.params.projectId as string, req.query.status as ProjectInvitationStatus | undefined);
    if (result instanceof Exception) return new HttpResponseDto().exception(res, result);
    return new HttpResponseDto().success(res, result);
  }

  async accept(req: Request, res: Response): Promise<Response> {
    const result = await this.invitationService.accept(req.params.invitationId as string, (req as any).user.id);
    if (result instanceof Exception) return new HttpResponseDto().exception(res, result);
    return new HttpResponseDto().success(res, result);
  }

  async decline(req: Request, res: Response): Promise<Response> {
    const result = await this.invitationService.decline(req.params.invitationId as string, (req as any).user.id);
    if (result instanceof Exception) return new HttpResponseDto().exception(res, result);
    return new HttpResponseDto().success(res, result);
  }

  async revoke(req: Request, res: Response): Promise<Response> {
    const result = await this.invitationService.revoke(req.params.projectId as string, req.params.invitationId as string, (req as any).user.id);
    if (result instanceof Exception) return new HttpResponseDto().exception(res, result);
    return new HttpResponseDto().success(res, result);
  }
}
