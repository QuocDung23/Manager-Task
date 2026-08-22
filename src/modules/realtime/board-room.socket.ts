import { Socket } from "socket.io";
import type { AppSocketServer } from "./socket.server";
import {
  boardRoom,
  ClientToServerEvents,
  InterServerEvents,
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

const sendAck = (ack: ((response: RealtimeAck) => void) | undefined, response: RealtimeAck): void => {
  ack?.(response);
};

export const registerBoardRoomHandlers = (
  _io: AppSocketServer,
  socket: AppSocket,
  permissionService = new RoomPermissionService(),
): void => {
  socket.on("board:join", async (payload, ack) => {
    const boardId = payload?.boardId;
    if (!boardId || !isUuid(boardId)) {
      sendAck(ack, { success: false, code: "INVALID_ID", error: "Invalid boardId" });
      return;
    }

    try {
      const result = await permissionService.authorizeBoard(socket.data.user.id, boardId);
      if (!result.allowed || !result.boardId) {
        console.warn("[realtime] board room join denied", {
          userId: socket.data.user.id,
          boardId,
          code: !result.allowed ? result.code : undefined,
        });
        sendAck(ack, {
          success: false,
          code: !result.allowed ? result.code : "INVALID_ID",
          error: !result.allowed ? result.error : "Board not allowed",
        });
        return;
      }

      await socket.join(boardRoom(result.boardId));
      console.debug("[realtime] board room joined", {
        userId: socket.data.user.id,
        boardId: result.boardId,
      });
      sendAck(ack, { success: true });
    } catch (error) {
      console.error("[realtime] board room join failed", {
        userId: socket.data.user.id,
        boardId,
        error,
      });
      sendAck(ack, { success: false, code: "INTERNAL_ERROR", error: "Join failed" });
    }
  });

  socket.on("board:leave", async (payload, ack) => {
    const boardId = payload?.boardId;
    if (!boardId || !isUuid(boardId)) {
      sendAck(ack, { success: false, code: "INVALID_ID", error: "Invalid boardId" });
      return;
    }

    try {
      await socket.leave(boardRoom(boardId));
      sendAck(ack, { success: true });
    } catch (error) {
      console.error("[realtime] board room leave failed", {
        userId: socket.data.user.id,
        boardId,
        error,
      });
      sendAck(ack, { success: false, code: "INTERNAL_ERROR", error: "Leave failed" });
    }
  });
};
