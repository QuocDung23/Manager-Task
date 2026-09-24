import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { TaskPermissions } from "@/common/enums/permissions";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { taskResponseSchema } from "../dtos/response";
import {
  attachTaskTagRequestSchema,
  attachTaskTagRequestValidationSchema,
  createTagRequestSchema,
  createTagRequestValidationSchema,
  deleteTagRequestSchema,
  deleteTagRequestValidationSchema,
  detachTaskTagRequestSchema,
  detachTaskTagRequestValidationSchema,
  getTagsRequestSchema,
  getTagsRequestValidationSchema,
  getTasksByTagRequestSchema,
  getTasksByTagRequestValidationSchema,
  replaceTaskTagsRequestSchema,
  replaceTaskTagsRequestValidationSchema,
  updateTagRequestSchema,
  updateTagRequestValidationSchema,
} from "./dtos/request";
import {
  getTasksByTagResponseSchema,
  tagResponseSchema,
} from "./dtos/response";
import { TaskTagController } from "./tag.controller";

export const taskTagRegistry = new OpenAPIRegistry();
const taskTagController = new TaskTagController();
const router = express.Router({ mergeParams: true });
autoBindUtil(taskTagController);

// GET /task/boards/:boardId/tags - danh sách tag/label của board
taskTagRegistry.registerPath({
  method: "get",
  path: "/task/boards/{boardId}/tags",
  tags: ["Task Tags"],
  request: getTagsRequestSchema,
  responses: createApiResponse(
    z.array(tagResponseSchema),
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/boards/:boardId/tags",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getTagsRequestValidationSchema),
  authMiddleware.verifyBoardPermission(TaskPermissions.VIEW_TASK),
  taskTagController.getTags,
);

// POST /task/boards/:boardId/tags - tạo tag/label trong board
taskTagRegistry.registerPath({
  method: "post",
  path: "/task/boards/{boardId}/tags",
  tags: ["Task Tags"],
  request: createTagRequestSchema,
  responses: createApiResponse(
    tagResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/boards/:boardId/tags",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createTagRequestValidationSchema),
  authMiddleware.verifyBoardPermission(TaskPermissions.CREATE_TASK_TAG),
  taskTagController.createTag,
);

// PATCH /task/boards/:boardId/tags/:tagId - sửa tag/label
taskTagRegistry.registerPath({
  method: "patch",
  path: "/task/boards/{boardId}/tags/{tagId}",
  tags: ["Task Tags"],
  request: updateTagRequestSchema,
  responses: createApiResponse(tagResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/boards/:boardId/tags/:tagId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(updateTagRequestValidationSchema),
  authMiddleware.verifyBoardPermission(TaskPermissions.UPDATE_TASK_TAG),
  taskTagController.updateTag,
);

// DELETE /task/boards/:boardId/tags/:tagId - xoá mềm tag/label
taskTagRegistry.registerPath({
  method: "delete",
  path: "/task/boards/{boardId}/tags/{tagId}",
  tags: ["Task Tags"],
  request: deleteTagRequestSchema,
  responses: createApiResponse(tagResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/boards/:boardId/tags/:tagId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(deleteTagRequestValidationSchema),
  authMiddleware.verifyBoardPermission(TaskPermissions.DELETE_TASK_TAG),
  taskTagController.deleteTag,
);

// GET /task/boards/:boardId/tags/:tagId/tasks - gom task có cùng tag
taskTagRegistry.registerPath({
  method: "get",
  path: "/task/boards/{boardId}/tags/{tagId}/tasks",
  tags: ["Task Tags"],
  request: getTasksByTagRequestSchema,
  responses: createApiResponse(
    getTasksByTagResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/boards/:boardId/tags/:tagId/tasks",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getTasksByTagRequestValidationSchema),
  authMiddleware.verifyBoardPermission(TaskPermissions.VIEW_TASK),
  taskTagController.getTasksByTag,
);

// PATCH /task/:taskId/tags - replace toàn bộ tag của task
taskTagRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/tags",
  tags: ["Task Tags"],
  request: replaceTaskTagsRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/:taskId/tags",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(replaceTaskTagsRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.ASSIGN_TASK_TAG),
  taskTagController.replaceTaskTags,
);

// POST /task/:taskId/tags/:tagId - gắn một tag vào task
taskTagRegistry.registerPath({
  method: "post",
  path: "/task/{taskId}/tags/{tagId}",
  tags: ["Task Tags"],
  request: attachTaskTagRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.post(
  "/:taskId/tags/:tagId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(attachTaskTagRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.ASSIGN_TASK_TAG),
  taskTagController.attachTaskTag,
);

// DELETE /task/:taskId/tags/:tagId - gỡ một tag khỏi task
taskTagRegistry.registerPath({
  method: "delete",
  path: "/task/{taskId}/tags/{tagId}",
  tags: ["Task Tags"],
  request: detachTaskTagRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:taskId/tags/:tagId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(detachTaskTagRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.UNASSIGN_TASK_TAG),
  taskTagController.detachTaskTag,
);

export const taskTagRouter = router;
