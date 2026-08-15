import { TaskPermissions } from "@/common/enums/permissions";
import { BoardRepository } from "@/modules/board/board.repository";
import { PermissionRepository } from "@/modules/permission/permission.repository";
import { TaskRepository } from "@/modules/tasks/task.repository";
import { BoardStatus } from "@prisma/client";

export type RoomPermissionCode = "INVALID_ID" | "NOT_FOUND" | "FORBIDDEN";

export type RoomPermissionResult =
  | { allowed: true; boardId: string; projectId: string }
  | { allowed: false; code: RoomPermissionCode; error: string };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class RoomPermissionService {
  constructor(
    private readonly boardRepository = new BoardRepository(),
    private readonly taskRepository = new TaskRepository(),
    private readonly permissionRepository = new PermissionRepository(),
  ) {}

  async authorizeBoard(
    userId: string,
    boardId: string,
  ): Promise<RoomPermissionResult> {
    if (!UUID_REGEX.test(boardId)) {
      return { allowed: false, code: "INVALID_ID", error: "Invalid boardId" };
    }

    const board = await this.boardRepository.getBoardById({ id: boardId });
    if (!board || board.status !== BoardStatus.ACTIVE) {
      return { allowed: false, code: "NOT_FOUND", error: "Board not found" };
    }

    const hasPermission = await this.permissionRepository.checkAnyPermission(
      userId,
      [TaskPermissions.VIEW_TASK],
      { boardId: board.id, projectId: board.projectId },
    );
    if (!hasPermission) {
      return { allowed: false, code: "FORBIDDEN", error: "Forbidden" };
    }

    return { allowed: true, boardId: board.id, projectId: board.projectId };
  }

  async authorizeTask(
    userId: string,
    taskId: string,
  ): Promise<RoomPermissionResult> {
    if (!UUID_REGEX.test(taskId)) {
      return { allowed: false, code: "INVALID_ID", error: "Invalid taskId" };
    }

    const task = await this.taskRepository.getTaskWithList(taskId);
    if (!task) {
      return { allowed: false, code: "NOT_FOUND", error: "Task not found" };
    }
    if (!task.list || task.list.deletedAt !== null) {
      return { allowed: false, code: "NOT_FOUND", error: "List not found" };
    }

    return this.authorizeBoard(userId, task.list.boardId);
  }
}

export const isUuid = (value: string): boolean => UUID_REGEX.test(value);
