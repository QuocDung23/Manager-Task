import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { TaskController } from "./task.controller";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import { StatusCodes } from "http-status-codes";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import {
  assignTaskRequestSchema,
  assignTaskRequestValidationSchema,
  clearTaskScheduleRequestSchema,
  clearTaskScheduleRequestValidationSchema,
  createTaskRequestSchema,
  createTaskRequestValidationSchema,
  getAllTaskRequestSchema,
  getAllTaskRequestValidationSchema,
  getTaskByIdRequestSchema,
  getTaskByIdRequestValidationSchema,
  moveTaskRequestSchema,
  moveTaskRequestValidationSchema,
  setTaskScheduleRequestSchema,
  setTaskScheduleRequestValidationSchema,
  unassignTaskRequestSchema,
  unassignTaskRequestValidationSchema,
  unlockTaskRequestSchema,
  unlockTaskRequestValidationSchema,
  updateTaskRequestSchema,
  updateTaskRequestValidationSchema,
  updateTaskStatusActionRequestSchema,
  updateTaskStatusActionRequestValidationSchema,
} from "./dtos/request";
import {
  moveTaskResponseSchema,
  taskResponseSchema,
} from "./dtos/response";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { ListPermissions, TaskPermissions } from "@/common/enums/permissions";

export const taskRegistry = new OpenAPIRegistry();
const taskController = new TaskController();
const router = express.Router({ mergeParams: true });
autoBindUtil(taskController);

// POST /task/:listId/tasks - tạo task trong list
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

// GET /task/:listId/tasks - danh sách task trong list
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

// PATCH /task/:taskId/schedule - đặt lịch hoặc reschedule task
taskRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/schedule",
  tags: ["Tasks"],
  request: setTaskScheduleRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/:taskId/schedule",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(setTaskScheduleRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.SCHEDULE_TASK),
  taskController.setTaskSchedule,
);

// DELETE /task/:taskId/schedule - xoá schedule task
taskRegistry.registerPath({
  method: "delete",
  path: "/task/{taskId}/schedule",
  tags: ["Tasks"],
  request: clearTaskScheduleRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:taskId/schedule",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(clearTaskScheduleRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.CLEAR_TASK_SCHEDULE),
  taskController.clearTaskSchedule,
);

// PATCH /task/:taskId/reschedule - alias rõ intent cho FE
taskRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/reschedule",
  tags: ["Tasks"],
  request: setTaskScheduleRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/:taskId/reschedule",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(setTaskScheduleRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.RESCHEDULE_TASK),
  taskController.setTaskSchedule,
);

// PATCH /task/:taskId/unlock - mở khoá thủ công
taskRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/unlock",
  tags: ["Tasks"],
  request: unlockTaskRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/:taskId/unlock",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(unlockTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.UNLOCK_TASK),
  taskController.unlockTask,
);

// PATCH /task/:taskId/move - di chuyển task
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

// PATCH /task/:taskId/assign - replace toàn bộ assignee
taskRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/assign",
  tags: ["Tasks"],
  request: assignTaskRequestSchema,
  responses: createApiResponse(
    taskResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/:taskId/assign",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(assignTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.ASSIGN_TASK),
  taskController.assignTask,
);

// DELETE /task/:taskId/assign/:userId - gỡ 1 assignee
taskRegistry.registerPath({
  method: "delete",
  path: "/task/{taskId}/assign/{userId}",
  tags: ["Tasks"],
  request: unassignTaskRequestSchema,
  responses: createApiResponse(
    taskResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.delete(
  "/:taskId/assign/:userId",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(unassignTaskRequestValidationSchema),
  authMiddleware.verifyTaskPermission(TaskPermissions.UNASSIGN_TASK),
  taskController.unassignTask,
);

// PATCH /task/:taskId/status-action - đổi trạng thái hành động của task
// Lưu ý: route này được khai báo TRƯỚC route /:id để tránh Express match nhầm dynamic route.
taskRegistry.registerPath({
  method: "patch",
  path: "/task/{taskId}/status-action",
  tags: ["Tasks"],
  request: updateTaskStatusActionRequestSchema,
  responses: createApiResponse(taskResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/:taskId/status-action",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(updateTaskStatusActionRequestValidationSchema),
  authMiddleware.verifyTaskPermission(
    TaskPermissions.UPDATE_TASK_STATUS_ACTION,
  ),
  taskController.updateTaskStatusAction,
);

// GET /task/:id - chi tiết task
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

// PUT /task/:id - cập nhật task
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

// DELETE /task/:id - xoá task
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
