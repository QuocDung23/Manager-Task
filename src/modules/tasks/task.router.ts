import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { TaskController } from "./task.controller";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import { StatusCodes } from "http-status-codes";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import {
  createTaskRequestSchema,
  createTaskRequestValidationSchema,
  getAllTaskRequestSchema,
  getAllTaskRequestValidationSchema,
  getTaskByIdRequestSchema,
  getTaskByIdRequestValidationSchema,
  moveTaskRequestSchema,
  moveTaskRequestValidationSchema,
  updateTaskRequestSchema,
  updateTaskRequestValidationSchema,
} from "./dtos/request";
import { moveTaskResponseSchema, taskResponseSchema } from "./dtos/response";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { ListPermissions, TaskPermissions } from "@/common/enums/permissions";
export const taskRegistry = new OpenAPIRegistry();
const taskController = new TaskController();
const router = express.Router({ mergeParams: true });
autoBindUtil(taskController);

taskRegistry.registerPath({
  method: "post",
  path: "/task/{listId}/tasks",
  tags: ["Tasks"],
  request: createTaskRequestSchema,
  responses: createApiResponse(
    taskResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:listId/tasks",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(ListPermissions.CREAT_TASK),
  taskController.createTask,
);

taskRegistry.registerPath({
  method: "get",
  path: "/task/{listId}/tasks",
  tags: ["Tasks"],
  request: getAllTaskRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/:listId/tasks",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getAllTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.VIEW_TASK),
  taskController.getAllTask,
);

// PATCH /task/:taskId/move
// Lưu ý: route này được khai báo TRƯỚC route /:id để tránh Express match nhầm dynamic route.
taskRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/move",
  tags: ["Tasks"],
  request: moveTaskRequestSchema,
  responses: createApiResponse(
    moveTaskResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/:taskId/move",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(moveTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.MOVE_TASK),
  taskController.moveTask,
);

taskRegistry.registerPath({
  method: "get",
  path: "/task/{id}",
  tags: ["Tasks"],
  request: getTaskByIdRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/:id",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getTaskByIdRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.VIEW_TASK),
  taskController.getTaskById,
);

taskRegistry.registerPath({
  method: "put",
  path: "/task/{id}",
  tags: ["Tasks"],
  request: updateTaskRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.put(
  "/:id",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(updateTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.UPDATE_TASK),
  taskController.updateTask,
);

taskRegistry.registerPath({
  method: "delete",
  path: "/task/{id}",
  tags: ["Tasks"],
  request: getTaskByIdRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:id",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(getTaskByIdRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.DELETE_TASK),
  taskController.deleteTask,
);

export const taskRouter = router;
