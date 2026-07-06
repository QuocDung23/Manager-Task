import "reflect-metadata";

import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";

import { openAPIRouter } from "./swagger";
import { Modules } from "./modules";
import { appEnv } from "./configs";
import { startAccountCleanupCron } from "./common/service/accountCleanup-cron.service";
import { initSocketServer } from "./modules/realtime";

const app: Express = express();

app.use(express.json());

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

const allowedOrigins = appEnv.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("combined"));

app.use("/health-check", Modules.healthCheckRouter);
app.use("/auth", Modules.authRouter);
app.use("/user", Modules.userRouter);
app.use("/project", Modules.projectRouter);
app.use("/board", Modules.boardRouter);
app.use("/list", Modules.listRouter);
app.use("/task", [Modules.taskRouter, Modules.taskCommentRouter]);

app.use(openAPIRouter);

startAccountCleanupCron();

const httpServer = http.createServer(app);
initSocketServer(httpServer, corsOptions);

httpServer.listen(appEnv.PORT, () => {
  const { NODE_ENV, HOST, PORT } = appEnv;
  console.log(
    `Server (${NODE_ENV}) running on port http://${HOST}:${PORT}/api`,
  );
});
