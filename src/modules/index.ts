import { authRegistry, authRouter } from "./auth/auth.router";
import {
  healthCheckRegistry,
  healthCheckRouter,
} from "./healthCheck/healthCheck.router";
import { userRegistry, userRouter } from "./user/user.router";

export const Registries = [healthCheckRegistry, authRegistry, userRegistry];

export const Modules = {
  healthCheckRouter,
  authRouter,
  userRouter,
};
