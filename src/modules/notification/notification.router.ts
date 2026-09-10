import express, { Request, Response } from "express";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { HttpResponseDto } from "@/common";
import { BadRequest } from "@tsed/exceptions";
import { notificationInboxService } from "./notification-inbox.service";

export const notificationRouter = express.Router();
notificationRouter.use(authMiddleware.verifyAccessToken);

function userId(req: Request): string {
  return (req as any).user.id as string;
}

notificationRouter.get("/", async (req: Request, res: Response) => {
  const filter = req.query.filter === "unread" ? "unread" : "all";
  const result = await notificationInboxService.list(
    userId(req),
    filter,
    typeof req.query.cursor === "string" ? req.query.cursor : undefined,
    Number(req.query.limit ?? 20),
  );
  return new HttpResponseDto().success(res, result);
});

notificationRouter.get("/unread-count", async (req: Request, res: Response) =>
  new HttpResponseDto().success(
    res,
    await notificationInboxService.unreadCount(userId(req)),
  ),
);

notificationRouter.patch(
  "/:notificationId/read",
  async (req: Request, res: Response) =>
    new HttpResponseDto().success(
      res,
      await notificationInboxService.setReadState(
        userId(req),
        String(req.params.notificationId),
        true,
      ),
    ),
);

notificationRouter.patch(
  "/:notificationId/unread",
  async (req: Request, res: Response) =>
    new HttpResponseDto().success(
      res,
      await notificationInboxService.setReadState(
        userId(req),
        String(req.params.notificationId),
        false,
      ),
    ),
);

notificationRouter.patch("/read-all", async (req: Request, res: Response) => {
  const before = new Date(req.body?.before);
  if (Number.isNaN(before.getTime())) throw new BadRequest("before is invalid");
  return new HttpResponseDto().success(
    res,
    await notificationInboxService.markAllRead(userId(req), before),
  );
});
