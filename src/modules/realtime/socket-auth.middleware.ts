import { Server, Socket } from "socket.io";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { jwtConfig } from "@/configs";
import { UserStatus } from "@prisma/client";
import { ITokenPayload } from "@/common/interface";
import { UserRepository } from "@/modules/user/user.repository";
import {
  ClientToServerEvents,
  InterServerEvents,
  RealtimeAck,
  ServerToClientEvents,
  SocketData,
} from "./realtime.types";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const socketAuthMiddleware = (
  userRepository: UserRepository = new UserRepository(),
) => {
  return async (
    socket: AppSocket,
    next: (err?: Error) => void,
  ): Promise<void> => {
    try {
      // 1. lấy token từ handshake
      const handshakeAuth = socket.handshake.auth as
        | Record<string, unknown>
        | undefined;
      const authToken =
        typeof handshakeAuth?.token === "string"
          ? handshakeAuth.token
          : undefined;
      const cookieHeader = socket.handshake.headers.cookie;
      const cookieToken = cookieHeader
        ?.split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const token = authToken ?? cookieToken;
      if (!token) {
        return next(new Error("Missing access token"));
      }

      // 2. verify JWT
      let payload: ITokenPayload;
      try {
        payload = verify(
          token,
          jwtConfig.secretAccessToken as string,
        ) as ITokenPayload;
      } catch (err: unknown) {
        if (err instanceof TokenExpiredError) {
          return next(new Error("Access token expired"));
        }
        if (err instanceof JsonWebTokenError) {
          return next(new Error("Invalid access token"));
        }
        return next(err instanceof Error ? err : new Error("Token verification failed"));
      }

      // 3. user phải active
      const userData = await userRepository.findUser({
        userId: payload.userId,
        status: UserStatus.ACTIVE,
      });
      if (!userData) {
        return next(new Error("User not found or inactive"));
      }

      // 4. gắn user vào socket.data
      socket.data.user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar ?? null,
      };
      next();
    } catch (err) {
      next(err as Error);
    }
  };
};
