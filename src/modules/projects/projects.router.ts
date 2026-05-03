import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ProjectController } from "./projects.controller";
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
  addProjectMemberRequestSchema,
  addProjectMemberRequestValidationSchema,
  projectMemberResponseSchema,
  projectResponseSchema,
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

export const projectRegistry = new OpenAPIRegistry();

const projectController = new ProjectController();
const boardController = new BoardController();
const router = express.Router({ mergeParams: true });
autoBindUtil(projectController);
autoBindUtil(boardController);

projectRegistry.registerPath({
  method: "get",
  path: "/project/getAlls",
  tags: ["Projects"],
  request: getAllProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/getAlls",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getAllProjectRequestValidationSchema),
  projectController.getAllProject,
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
    StatusCodes.OK,
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
  method: "put",
  path: "/project/{projectId}/update",
  tags: ["Projects"],
  request: updateProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.put(
  "/:projectId/update",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.UPDATE_PROJECT),
  validateRequestMiddleware(updateProjectRequestValidationSchema),
  projectController.updateProject,
);

router.put(
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
  request: addProjectMemberRequestSchema,
  responses: createApiResponse(
    z.array(projectMemberResponseSchema),
    "Success",
    StatusCodes.OK,
  ),
});
router.post(
  "/:projectId/members",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.ADD_MEMBER_PROJECT),
  validateRequestMiddleware(addProjectMemberRequestValidationSchema),
  projectController.addMember,
);

export const projectRouter = router;
