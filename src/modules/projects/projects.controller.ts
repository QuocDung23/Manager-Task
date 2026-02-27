import { Request, Response } from "express";
import { ProjectsService } from "./projects.service";
import { GetProjectRequestDto } from "./dtos/request/getProject.req";
import { Exception } from "@tsed/exceptions";
import { HttpResponseDto } from "@/common";
import { CreateProjectRequestDto, ProjectResponseDto } from "./dtos";

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

  async getAllProject() {}

  async createProject(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user

    const payload = {
      ...req.body,
      userId: user.id,
    };

    const projectDto = new CreateProjectRequestDto(payload);
    const result = await this.projectService.createProject(projectDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async updateProject() {}

  async deleteProject() {}
}
