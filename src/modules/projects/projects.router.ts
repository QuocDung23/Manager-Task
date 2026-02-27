import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ProjectController } from "./projects.controller";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import {
  getProjectSchema,
  getProjectRequestVadilationSchema,
} from "./dtos/request/getProject.req";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import {
  createProjectRequestSchema,
  createProjectRequestValidationSchema,
  projectResponseSchema,
} from "./dtos";
import { StatusCodes } from "http-status-codes";
import authMiddleware from "@/common/middlewares/auth.middleware";
import {
  getAllProjectRequestSchema,
  getAllProjectRequestValidationSchema,
} from "./dtos/request/getAllProject.req";
import {
  updateProjectRequestSchema,
  updateProjectRequestValidationSchema,
} from "./dtos/request/updateProject.req";

export const projectRegistry = new OpenAPIRegistry();

const projectController = new ProjectController();
const router = express.Router({ mergeParams: true });
autoBindUtil(projectController);

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
  path: "/project/create",
  tags: ["Projects"],
  request: createProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.post(
  "/create",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createProjectRequestValidationSchema),
  projectController.createProject,
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
  "/:projectId",
  authMiddleware.verifyAccessToken,
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
  validateRequestMiddleware(getProjectRequestVadilationSchema),
  projectController.deleteProject,
);

export const projectRouter = router;
