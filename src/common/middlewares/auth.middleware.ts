import { UserRepository } from "@/modules/user/user.repository";
import { BaseAutoBindMiddleware } from "./baseAutoBindmiddleware";
import { ClientException, Exception } from "@tsed/exceptions";
import { MyInfomationResDto } from "@/modules/user/dtos";
import {
  ForbiddenException,
  NotFoundException,
  OptionalException,
  UnauthorizedException,
} from "../exceptions";
import { ITokenPayload } from "../interface";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { jwtConfig } from "@/configs";
import { UserStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { PermissionRepository } from "@/modules/permission/permission.repository";
import { ListRepository } from "@/modules/lists/list.repository";
import { BoardRepository } from "@/modules/board/board.repository";
import { TaskRepository } from "@/modules/tasks/task.repository";
import { AuthRepository } from "@/modules/auth/auth.repository";

class AuthMiddleware extends BaseAutoBindMiddleware {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly permissionRepo = new PermissionRepository(),
    private readonly listRepository = new ListRepository(),
    private readonly boardRepository = new BoardRepository(),
    private readonly taskRepository = new TaskRepository(),
    private readonly authRepository = new AuthRepository(),
  ) {
    super();
  }

  async verifyAccessToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Exception> {
    const cookies = req.headers.cookie;
    const cookieToken = cookies
      ?.split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;
    const accessToken = cookieToken ?? headerToken;

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    try {
      const payload = verify(
        accessToken,
        jwtConfig.secretAccessToken as string,
      ) as ITokenPayload;

      const userData = await this.userRepository.findUser({
        userId: payload.userId,
        status: UserStatus.ACTIVE,
      });
      if (!userData) {
        throw new UnauthorizedException();
      }

      const user: MyInfomationResDto = new MyInfomationResDto(userData);
      (req as any).user = user;
    } catch (error: any) {
      if (error instanceof TokenExpiredError) {
        throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof ClientException) {
        throw error;
      }
      throw error;
    }
    next();
  }

  async verifyRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Exception> {
    const cookies = req.headers.cookie;
    const accessToken = cookies
      ?.split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
    const refreshToken = cookies
      ?.split("; ")
      .find((row) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const payloadRefreshToken: ITokenPayload = verify(
        refreshToken,
        jwtConfig.secretRefreshToken as string,
      ) as ITokenPayload;

      const savedToken = await this.authRepository.findTokenByUserId(
        payloadRefreshToken.userId,
      );
      if (!savedToken || savedToken.refreshToken !== refreshToken) {
        throw new UnauthorizedException("refresh token is invalid or expired");
      }

      const authHeader = req.headers.authorization;
      const headerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;
      const cookieAccessToken = headerToken ?? accessToken;
      if (cookieAccessToken) {
        const payloadAccessToken: ITokenPayload = verify(
          cookieAccessToken,
          jwtConfig.secretAccessToken as string,
          {
            ignoreExpiration: true,
          },
        ) as ITokenPayload;

        if (payloadAccessToken.userId !== payloadRefreshToken.userId) {
          throw new UnauthorizedException("token pair mismatch");
        }

        // if (payloadAccessToken.exp > Date.now() / 1000) {
        //   throw new OptionalException(
        //     StatusCodes.CONFLICT,
        //     "accesstoken has not expired yet",
        //   );
        // }
      }

      const userData = await this.userRepository.findUser({
        userId: payloadRefreshToken.userId,
        status: UserStatus.ACTIVE,
      });
      if (!userData) {
        throw new UnauthorizedException();
      }

      const user = new MyInfomationResDto(userData);
      (req as any).user = user;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error.message);
      }

      if (error instanceof ClientException) {
        throw error;
      }

      throw error;
    }

    next();
  }

  /**
   * Middleware kiểm tra user có ít nhất một trong các permission (system-level, từ userRoles).
   * Nên truyền enum: verifySystemPermission(ProjectPermissions.VIEW_PROJECT) hoặc SystemPermissions.MANAGE_USERS.
   */
  verifySystemPermission(...permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        if (!user) {
          throw new UnauthorizedException("Unverified");
        }
        const hasPermission = await this.permissionRepo.checkAnyPermission(
          user.id,
          permissions,
        );
        if (!hasPermission) {
          throw new ForbiddenException();
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Middleware kiểm tra user có quyền trong project (project-level, từ projectMembers).
   * Nên truyền enum: verifyProjectPermission(ProjectPermissions.UPDATE_PROJECT).
   */
  verifyProjectPermission(...permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        if (!user) {
          throw new UnauthorizedException("Unverified");
        }

        const projectId = (req.params?.projectId ||
          req.body?.projectId ||
          req.query?.projectId) as string;

        if (!projectId) {
          throw new NotFoundException("Project Not Found");
        }

        const hasPermission = await this.permissionRepo.checkAnyPermission(
          user.id,
          permissions,
          { projectId },
        );

        if (!hasPermission) {
          throw new ForbiddenException();
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  verifyBoardPermission(...permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        if (!user) {
          throw new UnauthorizedException("Unverified");
        }

        const boardId = ((req.params as any)?.boardId ||
          (req.body as any)?.boardId ||
          (req.query as any)?.boardId) as string;
        if (!boardId) {
          throw new NotFoundException("Board Not Found");
        }

        // Nếu user có role ở project-level (vd: PROJECT_ADMIN) thì vẫn nên được phép
        // thao tác trong phạm vi các board thuộc project đó.
        const board = await this.boardRepository.getBoardById({ id: boardId });
        if (!board) {
          throw new NotFoundException("Board Not Found");
        }

        const hasPermission = await this.permissionRepo.checkAnyPermission(
          user.id,
          permissions,
          { boardId, projectId: board.projectId },
        );

        if (!hasPermission) {
          throw new ForbiddenException();
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Middleware kiểm tra quyền theo listId.
   * Tự tìm `boardId` của list, rồi check permission theo context `{ boardId }`.
   */
  verifyListPermission(...permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {        
        const user = (req as any).user;
        if (!user) {
          throw new UnauthorizedException("Unverified");
        }

        const params = req.params as any;
        const body = req.body as any;
        const query = req.query as any;
        const listId = (params?.listId ??
          params?.id ??
          body?.listId ??
          query?.listId) as string | undefined;
        
        if (!listId) {
          throw new NotFoundException("List Not Found");
        }

        const list = await this.listRepository.getListById(listId);
        if (!list) {
          throw new NotFoundException(`List Not Found`);
        }

        const board = await this.boardRepository.getBoardById({ id: list.boardId });
        if (!board) {
          throw new NotFoundException(`Board Not Found`);
        }

        const hasPermission = await this.permissionRepo.checkAnyPermission(
          user.id,
          permissions,
          { boardId: list.boardId, projectId: board.projectId },
        );

        if (!hasPermission) {
          throw new ForbiddenException();
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }


  verifyTaskPermission(...permissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        if (!user) {
          throw new UnauthorizedException("Unverified");
        }

        const params = req.params as any;
        const body = req.body as any;
        const query = req.query as any;

        // List-scoped endpoints provide listId directly (e.g. /task/:listId/tasks).
        // Task-scoped endpoints provide task id (e.g. /task/:id), so resolve listId via task.
        let listId = (params?.listId ??
          body?.listId ??
          query?.listId) as string | undefined;

        if (!listId) {
          const taskId = (params?.taskId ??
            params?.id ??
            body?.taskId ??
            body?.id ??
            query?.taskId ??
            query?.id) as string | undefined;

          if (taskId) {
            const task = await this.taskRepository.getTaskById(taskId);
            if (!task) {
              throw new NotFoundException(`Task Not Found (${taskId})`);
            }
            listId = task.listId;
          }
        }

        if (!listId) {
          throw new NotFoundException("List Not Found");
        }

        const list = await this.listRepository.getListById(listId);
        if (!list) {
          throw new NotFoundException(`List Not Found (${listId})`);
        }

        const board = await this.boardRepository.getBoardById({
          id: list.boardId,
        });
        if (!board) {
          throw new NotFoundException(`Board Not Found (${list.boardId})`);
        }

        const hasPermission = await this.permissionRepo.checkAnyPermission(
          user.id,
          permissions,
          { boardId: list.boardId, projectId: board.projectId },
        );

        if (!hasPermission) {
          throw new ForbiddenException();
        }

        next();
      }
      catch (error) {
        next(error);
      }
    }
  }
}

export default new AuthMiddleware();
