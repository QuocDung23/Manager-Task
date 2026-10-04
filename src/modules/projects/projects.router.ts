import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ProjectController } from "./projects.controller";
import { ProjectInvitationController } from "./project-invitation.controller";
import { BoardController } from "../board/board.controller";
import express from "express";
import { z } from "zod";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import {
  getProjectSchema,
  getProjectRequestVadilationSchema,
} from "./dtos/request/getProject.req";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import {
  addProjectMemberRequestValidationSchema,
  deleteProjectMemberRequestSchema,
  deleteProjectMemberRequestValidationSchema,
  getProjectMembersRequestSchema,
  getProjectMembersRequestValidationSchema,
  projectCountResponseSchema,
  projectMemberResponseSchema,
  projectMembersResponseSchema,
  projectResponseSchema,
  updateProjectMemberRequestSchema,
  updateProjectMemberRequestValidationSchema,
  createProjectInvitationRequestSchema,
  createProjectInvitationValidationSchema,
  getMyProjectInvitationsRequestSchema,
  getMyProjectInvitationsValidationSchema,
  projectInvitationActionRequestSchema,
  projectInvitationActionValidationSchema,
  getProjectInvitationsRequestSchema,
  getProjectInvitationsValidationSchema,
  revokeProjectInvitationRequestSchema,
  revokeProjectInvitationValidationSchema,
  leaveProjectRequestSchema,
  leaveProjectValidationSchema,

} from "./dtos";
import { StatusCodes } from "http-status-codes";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { ProjectPermissions } from "@/common/enums/permissions";
import {
  getAllProjectRequestSchema,
  getAllProjectRequestValidationSchema,
} from "./dtos/request/getAllProject.req";
import {
  createBoardRequestSchema,
  createBoardRequestValidationSchema,
} from "../board/dtos/requests/createBoard.req";
import { boardResponseSchema } from "../board/dtos/responses/board.res";
import {
  updateProjectRequestSchema,
  updateProjectRequestValidationSchema,
} from "./dtos/request/updateProject.req";
import {
  createProjectRequestSchema,
  createProjectRequestValidationSchema,
} from "./dtos/request/createProject.req";
import { projectInvitationResponseSchema } from "./dtos/response/projectInvitation.res";

export const projectRegistry = new OpenAPIRegistry();

const projectController = new ProjectController();
const invitationController = new ProjectInvitationController();
const boardController = new BoardController();
const router = express.Router({ mergeParams: true });
autoBindUtil(projectController);
autoBindUtil(invitationController);
autoBindUtil(boardController);

projectRegistry.registerPath({
  method: "get",
  path: "/project/invitations/me",
  tags: ["Project invitations"],
  request: getMyProjectInvitationsRequestSchema,
  responses: createApiResponse(z.array(projectInvitationResponseSchema), "Success", StatusCodes.OK),
});
router.get(
  "/invitations/me",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getMyProjectInvitationsValidationSchema),
  invitationController.listMine,
);

projectRegistry.registerPath({
  method: "post",
  path: "/project/invitations/{invitationId}/accept",
  tags: ["Project invitations"],
  request: projectInvitationActionRequestSchema,
  responses: createApiResponse(projectMemberResponseSchema, "Success", StatusCodes.OK),
});
router.post(
  "/invitations/:invitationId/accept",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(projectInvitationActionValidationSchema),
  invitationController.accept,
);

projectRegistry.registerPath({
  method: "post",
  path: "/project/invitations/{invitationId}/decline",
  tags: ["Project invitations"],
  request: projectInvitationActionRequestSchema,
  responses: createApiResponse(projectInvitationResponseSchema, "Success", StatusCodes.OK),
});
router.post(
  "/invitations/:invitationId/decline",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(projectInvitationActionValidationSchema),
  invitationController.decline,
);

projectRegistry.registerPath({
  method: "post",
  path: "/project/{projectId}/invitations",
  tags: ["Project invitations"],
  request: createProjectInvitationRequestSchema,
  responses: createApiResponse(projectInvitationResponseSchema, "Created", StatusCodes.CREATED),
});
router.post(
  "/:projectId/invitations",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.ADD_MEMBER_PROJECT),
  validateRequestMiddleware(createProjectInvitationValidationSchema),
  invitationController.invite,
);

projectRegistry.registerPath({
  method: "get",
  path: "/project/{projectId}/invitations",
  tags: ["Project invitations"],
  request: getProjectInvitationsRequestSchema,
  responses: createApiResponse(z.array(projectInvitationResponseSchema), "Success", StatusCodes.OK),
});
router.get(
  "/:projectId/invitations",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.ADD_MEMBER_PROJECT),
  validateRequestMiddleware(getProjectInvitationsValidationSchema),
  invitationController.listProject,
);

projectRegistry.registerPath({
  method: "delete",
  path: "/project/{projectId}/invitations/{invitationId}",
  tags: ["Project invitations"],
  request: revokeProjectInvitationRequestSchema,
  responses: createApiResponse(projectInvitationResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:projectId/invitations/:invitationId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.REMOVE_MEMBER_PROJECT),
  validateRequestMiddleware(revokeProjectInvitationValidationSchema),
  invitationController.revoke,
);

projectRegistry.registerPath({
  method: "get",
  path: "/project",
  tags: ["Projects"],
  request: getAllProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getAllProjectRequestValidationSchema),
  projectController.getAllProject,
);

projectRegistry.registerPath({
  method: "get",
  path: "/project/count",
  tags: ["Projects"],
  request: getAllProjectRequestSchema,
  responses: createApiResponse(
    projectCountResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/count",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getAllProjectRequestValidationSchema),
  projectController.countProjects,
);

projectRegistry.registerPath({
  method: "post",
  path: "/project",
  tags: ["Projects"],
  request: createProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createProjectRequestValidationSchema),
  projectController.createProject,
);

projectRegistry.registerPath({
  method: "get",
  path: "/project/{projectId}",
  tags: ["Projects"],
  request: getProjectSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/:projectId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.VIEW_PROJECT),
  validateRequestMiddleware(getProjectRequestVadilationSchema),
  projectController.getProjectById,
);

projectRegistry.registerPath({
  method: "post",
  path: "/project/{projectId}/boards",
  tags: ["Projects"],
  request: createBoardRequestSchema,
  responses: createApiResponse(
    boardResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:projectId/boards",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.CREATE_BOARD),
  validateRequestMiddleware(createBoardRequestValidationSchema),
  boardController.createBoard,
);

projectRegistry.registerPath({
  method: "patch",
  path: "/project/{projectId}",
  tags: ["Projects"],
  request: updateProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/:projectId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.UPDATE_PROJECT),
  validateRequestMiddleware(updateProjectRequestValidationSchema),
  projectController.updateProject,
);
projectRegistry.registerPath({
  method: "delete",
  path: "/project/{projectId}",
  tags: ["Projects"],
  request: getProjectSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.delete(
  "/:projectId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.DELETE_PROJECT),
  validateRequestMiddleware(getProjectRequestVadilationSchema),
  projectController.deleteProject,
);

projectRegistry.registerPath({
  method: "post",
  path: "/project/{projectId}/members",
  tags: ["Projects"],
  deprecated: true,
  request: createProjectInvitationRequestSchema,
  responses: createApiResponse(
    projectInvitationResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:projectId/members",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.ADD_MEMBER_PROJECT),
  validateRequestMiddleware(addProjectMemberRequestValidationSchema),
  projectController.addMember,
);

projectRegistry.registerPath({
  method: "get",
  path: "/project/{projectId}/members",
  tags: ["Projects"],
  request: getProjectMembersRequestSchema,
  responses: createApiResponse(
    projectMembersResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/:projectId/members",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.VIEW_PROJECT),
  validateRequestMiddleware(getProjectMembersRequestValidationSchema),
  projectController.getProjectMembers,
);

projectRegistry.registerPath({
  method: "delete",
  path: "/project/{projectId}/members/me",
  tags: ["Projects"],
  request: leaveProjectRequestSchema,
  responses: createApiResponse(projectMemberResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:projectId/members/me",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(leaveProjectValidationSchema),
  projectController.leaveProject,
);

projectRegistry.registerPath({
  method: "patch",
  path: "/project/{projectId}/members/{memberId}",
  tags: ["Projects"],
  request: updateProjectMemberRequestSchema,
  responses: createApiResponse(
    projectMemberResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/:projectId/members/:memberId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(
    ProjectPermissions.UPDATE_ROLE_MEMBER_PROJECT,
  ),
  validateRequestMiddleware(updateProjectMemberRequestValidationSchema),
  projectController.updateProjectMember,
);

projectRegistry.registerPath({
  method: "delete",
  path: "/project/{projectId}/members/{memberId}",
  tags: ["Projects"],
  request: deleteProjectMemberRequestSchema,
  responses: createApiResponse(
    projectMemberResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.delete(
  "/:projectId/members/:memberId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(
    ProjectPermissions.REMOVE_MEMBER_PROJECT,
  ),
  validateRequestMiddleware(deleteProjectMemberRequestValidationSchema),
  projectController.removeProjectMember,
);

export const projectRouter = router;
