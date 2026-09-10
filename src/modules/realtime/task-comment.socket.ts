import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  taskRoom,
} from "./realtime.types";
import { isUuid, RoomPermissionService } from "./room-permission.service";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const registerTaskCommentHandlers = (
  _io: import("./socket.server").AppSocketServer,
  socket: AppSocket,
  permissionService = new RoomPermissionService(),
): void => {
  socket.on("task:join", async (payload, ack) => {
    try {
      const taskId = payload?.taskId;
      if (!taskId || !isUuid(taskId)) {
        ack?.({ success: false, code: "INVALID_ID", error: "Invalid taskId" });
        return;
      }
      const result = await permissionService.authorizeTask(socket.data.user.id, taskId);
      if (!result.allowed) {
        console.warn("[realtime] task room join denied", {
          userId: socket.data.user.id,
          taskId,
          code: result.code,
        });
        ack?.({ success: false, code: result.code, error: result.error });
        return;
      }
      await socket.join(taskRoom(taskId));
      console.debug("[realtime] task room joined", {
        userId: socket.data.user.id,
        taskId,
      });
      ack?.({ success: true });
    } catch (error) {
      console.error("[realtime] task room join failed", {
        userId: socket.data.user.id,
        taskId: payload?.taskId,
        error,
      });
      ack?.({ success: false, code: "INTERNAL_ERROR", error: "Join failed" });
    }
  });

  socket.on("task:leave", async (payload, ack) => {
    try {
      const taskId = payload?.taskId;
      if (!taskId || !isUuid(taskId)) {
        ack?.({ success: false, code: "INVALID_ID", error: "Invalid taskId" });
        return;
      }
      await socket.leave(taskRoom(taskId));
      console.debug("[realtime] task room left", {
        userId: socket.data.user.id,
        taskId,
      });
      ack?.({ success: true });
    } catch (error) {
      console.error("[realtime] task room leave failed", {
        userId: socket.data.user.id,
        taskId: payload?.taskId,
        error,
      });
      ack?.({ success: false, code: "INTERNAL_ERROR", error: "Leave failed" });
    }
  });
};
