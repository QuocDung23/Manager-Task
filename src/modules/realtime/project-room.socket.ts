import { Socket } from "socket.io";
import type { AppSocketServer } from "./socket.server";
import {
  ClientToServerEvents,
  InterServerEvents,
  projectRoom,
  RealtimeAck,
  ServerToClientEvents,
  SocketData,
} from "./realtime.types";
import { RoomPermissionService, isUuid } from "./room-permission.service";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const sendAck = (
  ack: ((response: RealtimeAck) => void) | undefined,
  response: RealtimeAck,
): void => {
  ack?.(response);
};

export const registerProjectRoomHandlers = (
  _io: AppSocketServer,
  socket: AppSocket,
  permissionService = new RoomPermissionService(),
): void => {
  socket.on("project:join", async (payload, ack) => {
    const projectId = payload?.projectId;
    if (!projectId || !isUuid(projectId)) {
      sendAck(ack, {
        success: false,
        code: "INVALID_ID",
        error: "Invalid projectId",
      });
      return;
    }

    try {
      const result = await permissionService.authorizeProject(
        socket.data.user.id,
        projectId,
      );
      if (!result.allowed) {
        console.warn("[realtime] project room join denied", {
          userId: socket.data.user.id,
          projectId,
          code: result.code,
        });
        sendAck(ack, { success: false, code: result.code, error: result.error });
        return;
      }

      await socket.join(projectRoom(result.projectId));
      console.debug("[realtime] project room joined", {
        userId: socket.data.user.id,
        projectId: result.projectId,
      });
      sendAck(ack, { success: true });
    } catch (error) {
      console.error("[realtime] project room join failed", {
        userId: socket.data.user.id,
        projectId,
        error,
      });
      sendAck(ack, {
        success: false,
        code: "INTERNAL_ERROR",
        error: "Join failed",
      });
    }
  });

  socket.on("project:leave", async (payload, ack) => {
    const projectId = payload?.projectId;
    if (!projectId || !isUuid(projectId)) {
      sendAck(ack, {
        success: false,
        code: "INVALID_ID",
        error: "Invalid projectId",
      });
      return;
    }

    try {
      await socket.leave(projectRoom(projectId));
      console.debug("[realtime] project room left", {
        userId: socket.data.user.id,
        projectId,
      });
      sendAck(ack, { success: true });
    } catch (error) {
      console.error("[realtime] project room leave failed", {
        userId: socket.data.user.id,
        projectId,
        error,
      });
      sendAck(ack, {
        success: false,
        code: "INTERNAL_ERROR",
        error: "Leave failed",
      });
    }
  });
};
