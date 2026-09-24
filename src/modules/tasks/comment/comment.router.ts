import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import { StatusCodes } from "http-status-codes";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { TaskPermissions } from "@/common/enums/permissions";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { TaskCommentController } from "./comment.controller";
import {
  createCommentReplyRequestSchema,
  createCommentReplyRequestValidationSchema,
  createCommentRequestSchema,
  createCommentRequestValidationSchema,
  deleteCommentRequestSchema,
  deleteCommentRequestValidationSchema,
  getCommentRepliesRequestSchema,
  getCommentRepliesRequestValidationSchema,
  getCommentsRequestSchema,
  getCommentsRequestValidationSchema,
  updateCommentRequestSchema,
  updateCommentRequestValidationSchema,
} from "./dtos/request";
import {
  commentResponseSchema,
  deleteCommentResponseSchema,
  getCommentRepliesResponseSchema,
  getCommentsResponseSchema,
} from "./dtos/response";

export const taskCommentRegistry = new OpenAPIRegistry();
const taskCommentController = new TaskCommentController();
const router = express.Router({ mergeParams: true });
autoBindUtil(taskCommentController);

// GET /task/:taskId/comments - danh sách comment gốc
taskCommentRegistry.registerPath({
  method: "get",
  path: "/task/{taskId}/comments",
  tags: ["Task Comments"],
  request: getCommentsRequestSchema,
  responses: createApiResponse(
    getCommentsResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/:taskId/comments",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getCommentsRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.VIEW_TASK),
  taskCommentController.getTaskComments,
);

// POST /task/:taskId/comments - tạo comment gốc
taskCommentRegistry.registerPath({
  method: "post",
  path: "/task/{taskId}/comments",
  tags: ["Task Comments"],
  request: createCommentRequestSchema,
  responses: createApiResponse(
    commentResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:taskId/comments",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createCommentRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.CREATE_TASK_COMMENT),
  taskCommentController.createTaskComment,
);

// POST /task/:taskId/comments/:commentId/replies - reply comment
taskCommentRegistry.registerPath({
  method: "post",
  path: "/task/{taskId}/comments/{commentId}/replies",
  tags: ["Task Comments"],
  request: createCommentReplyRequestSchema,
  responses: createApiResponse(
    commentResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:taskId/comments/:commentId/replies",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createCommentReplyRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.CREATE_TASK_COMMENT),
  taskCommentController.createTaskCommentReply,
);

// GET /task/:taskId/comments/:commentId/replies - danh sách reply
taskCommentRegistry.registerPath({
  method: "get",
  path: "/task/{taskId}/comments/{commentId}/replies",
  tags: ["Task Comments"],
  request: getCommentRepliesRequestSchema,
  responses: createApiResponse(
    getCommentRepliesResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/:taskId/comments/:commentId/replies",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getCommentRepliesRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.VIEW_TASK),
  taskCommentController.getTaskCommentReplies,
);

// PATCH /task/:taskId/comments/:commentId - sửa comment/reply
taskCommentRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/comments/{commentId}",
  tags: ["Task Comments"],
  request: updateCommentRequestSchema,
  responses: createApiResponse(
    commentResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/:taskId/comments/:commentId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(updateCommentRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.UPDATE_TASK_COMMENT),
  taskCommentController.updateTaskComment,
);

// DELETE /task/:taskId/comments/:commentId - xoá comment/reply
taskCommentRegistry.registerPath({
  method: "delete",
  path: "/task/{taskId}/comments/{commentId}",
  tags: ["Task Comments"],
  request: deleteCommentRequestSchema,
  responses: createApiResponse(
    deleteCommentResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.delete(
  "/:taskId/comments/:commentId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(deleteCommentRequestValidationSchema),
  authMiddleware.verifyTaskPermission(
    TaskPermissions.UPDATE_TASK_COMMENT,
    TaskPermissions.DELETE_TASK_COMMENT,
  ),
  taskCommentController.deleteTaskComment,
);

export const taskCommentRouter = router;