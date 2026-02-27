import {
  ConflictException,
  HttpResponseBodySuccessDto,
  NotFoundException,
  PaginationDto,
  PaginationUtils,
} from "@/common";
import { CreateProjectRequestDto, ProjectResponseDto } from "./dtos";
import { ProjectsRepository } from "./projects.repository";
import { Exception } from "@tsed/exceptions";
import { GetProjectRequestDto } from "./dtos/request/getProject.req";
import { Prisma } from "@prisma/client";
import { GetAllProjectRequestDto } from "./dtos/request/getAllProject.req";
import { UpdateProjectRequestDto } from "./dtos/request/updateProject.req";

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

  async getAllProject(
    getAllProjects: GetAllProjectRequestDto,
    paginationDto: PaginationDto,
  ): Promise<HttpResponseBodySuccessDto<ProjectResponseDto[]>> {
    const { name, status, userId } = getAllProjects;
    const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
      paginationDto,
    );
    const { skip, take } = paginationUtils;

    const [projects, totalProjects] = await this.projectsRepository.getProjects(
      {
        userId: userId as string,
        name,
        status,
        skip,
        take,
      },
    );

    const projectResponse = projects.map(
      (project) => new ProjectResponseDto(project),
    );
    return {
      success: true,
      data: projectResponse,
      pagination:
        paginationUtils.convertPaginationResponseDtoFromTotalRecords(
          totalProjects,
        ),
    };
  }

  async createProject(
    createProjectDto: CreateProjectRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ProjectResponseDto> | Exception> {
    const existingProject = await this.projectsRepository.getProject({
      name: createProjectDto.name,
      userId: createProjectDto.userId,
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

  async updateProject(
    id: string,
    userId: string,
    updateProjectDto: UpdateProjectRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ProjectResponseDto> | Exception> {
    const projectExist = await this.projectsRepository.getProject({
      id,
      userId,
    });
    if (!projectExist) {
      throw new NotFoundException("Project not found");
    }

    const updateProject = await this.projectsRepository.updateProject({
      id,
      project: {
        name: updateProjectDto.name,
        description: updateProjectDto.description,
      },
    });

    return {
      success: true,
      data: new ProjectResponseDto(updateProject),
    };
  }

  async deleteProject(
    id: string,
    userId: string,
  ): Promise<HttpResponseBodySuccessDto<ProjectResponseDto> | Exception> {
    const projectExist = await this.projectsRepository.getProject({
      id,
      userId,
    });
    if (!projectExist) {
      throw new NotFoundException("Project not found");
    }

    const deletedProject = await this.projectsRepository.deleteProject({
      id,
      userId,
    });

    return {
      success: true,
      data: new ProjectResponseDto(deletedProject),
    };
  }
}
