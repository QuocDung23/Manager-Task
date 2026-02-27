import {
  ConflictException,
  HttpResponseBodySuccessDto,
  NotFoundException,
} from "@/common";
import { CreateProjectRequestDto, ProjectResponseDto } from "./dtos";
import { ProjectsRepository } from "./projects.repository";
import { Exception } from "@tsed/exceptions";
import { GetProjectRequestDto } from "./dtos/request/getProject.req";
import { Prisma } from "@prisma/client";

export class ProjectsService {
  constructor(private readonly projectsRepository = new ProjectsRepository()) {}

  async getProjectById(
    getProjectDto: GetProjectRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ProjectResponseDto> | Exception> {
    const { projectId, status, name } = getProjectDto;
    const project = await this.projectsRepository.getProject({
      id: projectId,
      name: name,
      status: status,
    });
    if (!project) {
      throw new NotFoundException("project not exist");
    }

    return {
      success: true,
      data: new ProjectResponseDto(project),
    };
  }

  async getAllProject() {}

  async createProject(
    createProjectDto: CreateProjectRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ProjectResponseDto> | Exception> {
    const existingProject = await this.projectsRepository.getProject({
      name: createProjectDto.name,
      userId: createProjectDto.userId
    });
    if (existingProject) {
      throw new ConflictException("project already exist");
    }

    const createProject: Prisma.projectsCreateInput = {
      name: createProjectDto.name,
      description: createProjectDto.description,
      user: {
        connect: { id: createProjectDto.userId },
      },
    };

    const newProject = await this.projectsRepository.createProject({
      project: createProject,
    });
    return {
      success: true,
      data: new ProjectResponseDto(newProject as any),
    };
  }

  async updateProject() {}

  async deleteProject() {}
}
