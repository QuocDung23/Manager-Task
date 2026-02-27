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

export const projectRegistry = new OpenAPIRegistry();

const projectController = new ProjectController();
const router = express.Router({ mergeParams: true });
autoBindUtil(projectController);

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

export const projectRouter = router;
