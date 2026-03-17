import "reflect-metadata";

import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { openAPIRouter } from "./swagger";
import { Modules } from "./modules";
import { appEnv } from "./configs";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { BoardPermissions } from "@/common/enums/permissions";

const app: Express = express();

app.use(express.json());

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("combined"));

app.use("/health-check", Modules.healthCheckRouter);
app.use("/auth", Modules.authRouter);
app.use("/user", Modules.userRouter);
app.use("/project", Modules.projectRouter);
app.use("/board", Modules.boardRouter);
app.use("/list", Modules.listRouter);

app.use(openAPIRouter);

app.listen(appEnv.PORT, () => {
  const { NODE_ENV, HOST, PORT } = appEnv;
  console.log(
    `Server (${NODE_ENV}) running on port http://${HOST}:${PORT}/api`,
  );
});
