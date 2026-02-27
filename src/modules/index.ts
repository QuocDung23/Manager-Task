import { authRegistry, authRouter } from "./auth/auth.router";
import {
  healthCheckRegistry,
  healthCheckRouter,
} from "./healthCheck/healthCheck.router";
import { projectRegistry, projectRouter } from "./projects/projects.router";
import { userRegistry, userRouter } from "./user/user.router";

export const Registries = [
  healthCheckRegistry,
  authRegistry,
  userRegistry,
  projectRegistry,
];

export const Modules = {
  healthCheckRouter,
  authRouter,
  userRouter,
  projectRouter,
};
