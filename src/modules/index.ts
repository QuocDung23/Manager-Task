import { authRegistry, authRouter } from "./auth/auth.router";
import { boardRegistry } from "./board/board.router";
import {
  healthCheckRegistry,
  healthCheckRouter,
} from "./healthCheck/healthCheck.router";
import { listRegistry, listRouter } from "./lists/list.router";
import { projectRegistry, projectRouter } from "./projects/projects.router";
import { userRegistry, userRouter } from "./user/user.router";
import { boardRouter } from "./board/board.router";
import { taskRegistry, taskRouter } from "./tasks/task.router";

export const Registries = [
  healthCheckRegistry,
  authRegistry,
  userRegistry,
  projectRegistry,
  boardRegistry,
  listRegistry,
  taskRegistry
];

export const Modules = {
  healthCheckRouter,
  authRouter,
  userRouter,
  projectRouter,
  boardRouter,
  listRouter,
  taskRouter
};
