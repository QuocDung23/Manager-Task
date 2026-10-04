import {
  ConflictException,
  ForbiddenException,
  HttpResponseBodySuccessDto,
  InternalServerException,
  NotFoundException,
  PaginationDto,
  PaginationUtils,
} from "@/common";
import {
  AddProjectMemberRequestDto,
  CreateProjectRequestDto,
  ProjectCountResponseDto,
  ProjectMemberResponseDto,
  ProjectMembersResponseDto,
  ProjectResponseDto,
  UpdateProjectMemberRequestDto,
} from "./dtos";
import { ProjectsRepository } from "./projects.repository";
import { Exception } from "@tsed/exceptions";
import { GetProjectRequestDto } from "./dtos/request/getProject.req";
import {
  NotificationPriority,
  Prisma,
  ProjectStatus,
} from "@prisma/client";
import { GetAllProjectRequestDto } from "./dtos/request/getAllProject.req";
import { UpdateProjectRequestDto } from "./dtos/request/updateProject.req";
import { RoleRepository } from "../roles/roles.repository";
import { ProjectMemberRepo } from "../projectMember/projectMember.repository";
import { ProjectRole } from "@/common/enums/roles";
import { realtimeEventService } from "@/modules/realtime/realtime-event.service";
import { notificationInboxService } from "@/modules/notification";
import { ProjectInvitationService } from "./project-invitation.service";
import { ProjectInvitationResponseDto } from "./dtos/response/projectInvitation.res";
import { MembershipLeaveService } from "@/modules/projectMember/membership-leave.service";

export class ProjectsService {
  constructor(
    private readonly projectsRepository = new ProjectsRepository(),
    private readonly rolesRepository = new RoleRepository(),
    private readonly projectMemberRepository = new ProjectMemberRepo(),
    private readonly realtime = realtimeEventService,
    private readonly invitationService = new ProjectInvitationService(),
    private readonly membershipLeaveService = new MembershipLeaveService(),
  ) {}

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

  async countProjects(
    getAllProjects: GetAllProjectRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ProjectCountResponseDto>> {
    const totalProjects = await this.projectsRepository.countProjects({
      userId: getAllProjects.userId as string,
      name: getAllProjects.name,
      status: getAllProjects.status,
    });

    return {
      success: true,
      data: new ProjectCountResponseDto(totalProjects),
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

    const userId = createProjectDto.userId;
    const projectId = newProject.id;

    if (!userId || !projectId) {
      throw new InternalServerException();
    }

    const existingMember = await this.projectMemberRepository.findProjectMember(
      userId,
      projectId,
    );
    if (!existingMember) {
      const adminRole = await this.rolesRepository.findRolesName(
        ProjectRole.PROJECT_ADMIN,
      );
      if (!adminRole) {
        throw new InternalServerException();
      }

      await this.projectMemberRepository.assignUserRoleProject(
        userId,
        projectId,
        adminRole.id,
      );
    }

    const projectDto = new ProjectResponseDto(newProject as any);

    try {
      this.realtime.emitProjectCreated({
        project: projectDto,
        actorId: userId,
      });
    } catch (error) {
      console.error("[realtime] emitProjectCreated failed (HTTP continues)", {
        projectId: projectDto.id,
        userId,
        error,
      });
    }
    return {
      success: true,
      data: projectDto,
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

    // ProjectStatus INACTIVE (soft-delete đã xảy ra trước) thì không emit
    // update — board service khác sẽ lo delete event.
    if (updateProject.status === ProjectStatus.INACTIVE) {
      return {
        success: true,
        data: new ProjectResponseDto(updateProject),
      };
    }

    const projectDto = new ProjectResponseDto(updateProject);

    try {
      const recipientUserIds =
        await this.projectsRepository.getActiveProjectMemberUserIds(
          projectDto.id,
        );
      this.realtime.emitProjectUpdated({
        projectId: projectDto.id,
        project: projectDto,
        actorId: userId,
        recipientUserIds,
      });
    } catch (error) {
      console.error("[realtime] emitProjectUpdated failed (HTTP continues)", {
        projectId: projectDto.id,
        userId,
        error,
      });
    }
    return {
      success: true,
      data: projectDto,
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

    // Snapshot recipients TRƯỚC soft-delete vì query sau delete sẽ trả về record
    // đã INACTIVE/deleted, mất danh sách user cần fan-out realtime.
    const recipientUserIds =
      await this.projectsRepository.getActiveProjectMemberUserIds(id);

    const deletedProject = await this.projectsRepository.deleteProject({
      id,
      userId,
    });

    try {
      await this.invitationService.revokePendingForProject(id, userId);
    } catch (error) {
      console.error("[invitation] project deletion cleanup failed", { projectId: id, error });
    }

    const projectDto = new ProjectResponseDto(deletedProject);

    try {
      this.realtime.emitProjectDeleted({
        projectId: projectDto.id,
        project: projectDto,
        actorId: userId,
        recipientUserIds,
      });
    } catch (error) {
      console.error("[realtime] emitProjectDeleted failed (HTTP continues)", {
        projectId: projectDto.id,
        userId,
        error,
      });
    }

    return {
      success: true,
      data: projectDto,
    };
  }

  async addMember(
    projectId: string,
    addMemberDto: AddProjectMemberRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<ProjectInvitationResponseDto> | Exception> {
    if (!actorUserId) throw new ForbiddenException("Unverified");
    return this.invitationService.invite(projectId, addMemberDto.userId, actorUserId);
  }

  async getProjectMembers(
    projectId: string,
  ): Promise<HttpResponseBodySuccessDto<ProjectMembersResponseDto>> {
    const project = await this.projectsRepository.getProject({ id: projectId });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const members =
      await this.projectMemberRepository.getProjectMembers(projectId);

    const memberResponses = members.map(
      (member) => new ProjectMemberResponseDto(member),
    );

    return {
      success: true,
      data: new ProjectMembersResponseDto(memberResponses),
    };
  }

  async updateProjectMember(
    projectId: string,
    memberId: string,
    updateMemberDto: UpdateProjectMemberRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<ProjectMemberResponseDto> | Exception> {
    const project = await this.projectsRepository.getProject({ id: projectId });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const member = await this.projectMemberRepository.getProjectMemberById(
      projectId,
      memberId,
    );
    if (!member) {
      throw new NotFoundException("Project member not found");
    }

    const role = await this.rolesRepository.findRoleById(
      updateMemberDto.roleId,
    );
    if (
      !role ||
      !Object.values(ProjectRole).includes(role.name as ProjectRole)
    ) {
      throw new NotFoundException("Project role not found");
    }

    if (
      member.userId === project.userId &&
      role.name !== ProjectRole.PROJECT_ADMIN
    ) {
      throw new ForbiddenException("Project owner role cannot be changed");
    }

    const updatedMember =
      await this.projectMemberRepository.updateProjectMemberRole(
        projectId,
        memberId,
        role.id,
      );

    const memberDto = new ProjectMemberResponseDto(updatedMember);

    try {
      this.realtime.emitProjectMemberRoleUpdated({
        projectId,
        member: memberDto,
        actorId: actorUserId ?? null,
      });
    } catch (error) {
      console.error(
        "[realtime] emitProjectMemberRoleUpdated failed (HTTP continues)",
        {
          projectId,
          memberId: memberDto.id,
          actorUserId,
          error,
        },
      );
    }
    const roleLabel =
      role.name === ProjectRole.PROJECT_ADMIN ? "Project admin" : "Project member";
    const notification = {
      type: "PROJECT_MEMBER_ROLE_CHANGED" as const,
      title: "Your project role changed",
      body: `Your role in "${project.name}" is now ${roleLabel}.`,
      data: {
        roleId: memberDto.roleId,
        roleName: role.name,
        projectName: project.name,
      },
    };
    await notificationInboxService.createForRecipients({
      recipientIds: [memberDto.userId],
      actorId: actorUserId,
      priority: NotificationPriority.DIRECT,
      projectId,
      dedupeKey: (recipientId) =>
        `project:${projectId}:role:${memberDto.id}:${memberDto.roleId}:${recipientId}`,
      ...notification,
    });
    if (memberDto.userId !== actorUserId) {
      this.realtime.emitUserNotification(memberDto.userId, {
        ...notification,
        createdAt: new Date(),
      });
    }

    return {
      success: true,
      data: memberDto,
    };
  }

  async removeProjectMember(
    projectId: string,
    memberId: string,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<ProjectMemberResponseDto> | Exception> {
    if (!actorUserId) throw new ForbiddenException("Unverified");
    return this.membershipLeaveService.removeProjectMember(projectId, memberId, actorUserId);
  }

  async leaveProject(
    projectId: string,
    userId: string,
  ): Promise<HttpResponseBodySuccessDto<ProjectMemberResponseDto> | Exception> {
    return this.membershipLeaveService.leaveProject(projectId, userId);
  }
}
