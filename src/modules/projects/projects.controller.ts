import { Request, Response } from "express";
import { ProjectsService } from "./projects.service";
import { GetProjectRequestDto } from "./dtos/request/getProject.req";
import { Exception } from "@tsed/exceptions";
import { HttpResponseDto, PaginationDto } from "@/common";
import {
  AddProjectMemberRequestDto,
  CreateProjectRequestDto,
  UpdateProjectMemberRequestDto,
} from "./dtos";
import { GetAllProjectRequestDto } from "./dtos/request/getAllProject.req";
import { UpdateProjectRequestDto } from "./dtos/request/updateProject.req";

export class ProjectController {
  constructor(private readonly projectService = new ProjectsService()) {}

  async getProjectById(req: Request, res: Response): Promise<Response> {
    const { projectId } = req.params;
    const getProject = new GetProjectRequestDto({
      projectId: projectId as string,
      ...(req.query as any),
    } as GetProjectRequestDto);
    const result = await this.projectService.getProjectById(getProject);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async getAllProject(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const getAllProject = new GetAllProjectRequestDto({
      ...(req.query as any),
      userId: user.id,
    } as GetAllProjectRequestDto);
    const pagination: PaginationDto = new PaginationDto(req.query);
    const result = await this.projectService.getAllProject(
      getAllProject,
      pagination,
    );
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async countProjects(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const getAllProject = new GetAllProjectRequestDto({
      ...(req.query as any),
      userId: user.id,
    } as GetAllProjectRequestDto);
    const result = await this.projectService.countProjects(getAllProject);

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async createProject(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;

    const payload = {
      ...req.body,
      userId: user.id,
    };

    const projectDto = new CreateProjectRequestDto(payload);
    const result = await this.projectService.createProject(projectDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().created(res, result);
  }

  async updateProject(req: Request, res: Response): Promise<Response> {
    const { projectId } = req.params;
    const user = (req as any).user;
    const updateProjectDto = new UpdateProjectRequestDto(req.body as any);

    const result = await this.projectService.updateProject(
      projectId as string,
      user.id,
      updateProjectDto,
    );

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async deleteProject(req: Request, res: Response): Promise<Response> {
    const { projectId } = req.params;
    const user = (req as any).user;

    const result = await this.projectService.deleteProject(
      projectId as string,
      user.id,
    );

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async addMember(req: Request, res: Response): Promise<Response> {
    const { projectId } = req.params;
    const user = (req as any).user;

    const addMemberDto = new AddProjectMemberRequestDto(req.body as any);
    const result = await this.projectService.addMember(
      projectId as string,
      addMemberDto,
      user?.id,
    );

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().created(res, result);
  }

  async getProjectMembers(req: Request, res: Response): Promise<Response> {
    const { projectId } = req.params;
    const result = await this.projectService.getProjectMembers(
      projectId as string,
    );

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

async updateProjectMember(req: Request, res: Response): Promise<Response> {
    const { projectId, memberId } = req.params;
    const user = (req as any).user;
    const updateMemberDto = new UpdateProjectMemberRequestDto(req.body as any);
    const result = await this.projectService.updateProjectMember(
      projectId as string,
      memberId as string,
      updateMemberDto,
      user?.id,
    );

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

async removeProjectMember(req: Request, res: Response): Promise<Response> {
    const { projectId, memberId } = req.params;
    const user = (req as any).user;
    const result = await this.projectService.removeProjectMember(
      projectId as string,
      memberId as string,
      user?.id,
    );

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }
}
