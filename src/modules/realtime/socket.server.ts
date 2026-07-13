import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { CorsOptions } from "cors";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  userRoom,
} from "./realtime.types";
import { socketAuthMiddleware } from "./socket-auth.middleware";
import { registerTaskCommentHandlers } from "./task-comment.socket";
import { realtimeEventService } from "./realtime-event.service";

export type AppSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let ioInstance: AppSocketServer | null = null;

export const getIO = (): AppSocketServer | null => ioInstance;

export const initSocketServer = (
  httpServer: HttpServer,
  corsOptions: CorsOptions,
): AppSocketServer => {
  const io: AppSocketServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        // Ở đây corsOptions.origin có thể là function hoặc array, ta gọi lại để tận dụng cùng allowlist với HTTP
        const fn = corsOptions.origin as unknown as (
          o: string | undefined,
          cb: (err: Error | null, allow?: boolean) => void,
        ) => void;
        if (typeof fn === "function") {
          fn(origin, (err, allow) => {
            if (err) return callback(err, false);
            return callback(null, !!allow);
          });
          return;
        }
        if (Array.isArray(corsOptions.origin)) {
          return callback(null, corsOptions.origin.includes(origin));
        }
        return callback(null, true);
      },
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware());

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.data.user.id));
    registerTaskCommentHandlers(io, socket);
  });

  ioInstance = io;
  realtimeEventService.setIO(io);

  return io;
};
