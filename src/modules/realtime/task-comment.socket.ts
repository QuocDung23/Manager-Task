import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  taskRoom,
} from "./realtime.types";
import { TaskRepository } from "@/modules/tasks/task.repository";
import { BoardRepository } from "@/modules/board/board.repository";
import { PermissionRepository } from "@/modules/permission/permission.repository";
import { TaskPermissions } from "@/common/enums/permissions";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verify user có quyền VIEW_TASK cho task này.
 * Trả về `null` nếu hợp lệ, hoặc string error message.
 */
const verifyUserCanJoinTask = async (
  socket: AppSocket,
  taskId: string,
): Promise<string | null> => {
  const user = socket.data.user;
  if (!user) return "Unauthenticated";

  if (!UUID_REGEX.test(taskId)) return "Invalid taskId";

  const taskRepo = new TaskRepository();
  const boardRepo = new BoardRepository();
  const permRepo = new PermissionRepository();

  const task = await taskRepo.getTaskById(taskId);
  if (!task) return "Task not found";

  const list = await (taskRepo as any).getTaskWithList(taskId);
  if (!list || !list.list || list.list.deletedAt !== null) {
    return "List not found";
  }

  const board = await boardRepo.getBoardById({ id: list.list.boardId });
  if (!board || board.deletedAt !== null) {
    return "Board not found";
  }

  const hasPermission = await permRepo.checkAnyPermission(
    user.id,
    [TaskPermissions.VIEW_TASK],
    { boardId: list.list.boardId, projectId: board.projectId },
  );
  if (!hasPermission) return "Forbidden";

  return null;
};

export const registerTaskCommentHandlers = (
  io: import("./socket.server").AppSocketServer,
  socket: AppSocket,
): void => {
  socket.on("task:join", async (payload, ack) => {
    try {
      const taskId = payload?.taskId;
      if (!taskId) {
        ack?.({ success: false, error: "taskId is required" });
        return;
      }
      const err = await verifyUserCanJoinTask(socket, taskId);
      if (err) {
        ack?.({ success: false, error: err });
        return;
      }
      await socket.join(taskRoom(taskId));
      ack?.({ success: true });
    } catch (e: any) {
      ack?.({ success: false, error: e?.message ?? "join failed" });
    }
  });

  socket.on("task:leave", async (payload, ack) => {
    try {
      const taskId = payload?.taskId;
      if (!taskId) {
        ack?.({ success: false, error: "taskId is required" });
        return;
      }
      await socket.leave(taskRoom(taskId));
      ack?.({ success: true });
    } catch (e: any) {
      ack?.({ success: false, error: e?.message ?? "leave failed" });
    }
  });
};
