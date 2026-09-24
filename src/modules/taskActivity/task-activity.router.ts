import express, { Request, Response } from "express";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { HttpResponseDto } from "@/common";
import { TaskPermissions } from "@/common/enums/permissions";
import { taskActivityService } from "./task-activity.service";

export const taskActivityRouter = express.Router({ mergeParams: true });

taskActivityRouter.get(
  "/:taskId/activities",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyTaskPermission(TaskPermissions.VIEW_TASK),
  async (req: Request, res: Response) => {
    const result = await taskActivityService.list(
      String(req.params.taskId),
      typeof req.query.cursor === "string" ? req.query.cursor : undefined,
      Number(req.query.limit ?? 20),
    );
    return new HttpResponseDto().success(res, result);
  },
);

export * from "./task-activity.service";
export * from "./task-activity.types";
