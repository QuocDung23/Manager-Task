import { Exception } from "@tsed/exceptions";
import { Request, Response } from "express";
import { HttpResponseDto, PaginationDto } from "@/common";
import { GetUserByUserIdRequestDto, GetUsersRequestDto } from "./dtos";
import { UserServicer } from "./user.service";

export class UserController {
  constructor(private readonly userService = new UserServicer()) {}

  async getUserByUserId(req: Request, res: Response): Promise<Response> {
    const { userId } = req.params;
    const getUserByUserIdRequestDto = new GetUserByUserIdRequestDto(
      userId as string,
      req.body,
    );

    const result = await this.userService.getUserByUserId(
      getUserByUserIdRequestDto,
    );
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async getAllUsers(req: Request, res: Response): Promise<Response> {
    const getUsersRequest: GetUsersRequestDto = new GetUsersRequestDto(req.query);
    const pagination: PaginationDto = new PaginationDto(req.query);

    const result = await this.userService.getAllUsers(
      getUsersRequest,
      pagination,
    );
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async getMyInfo(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return new HttpResponseDto().exception(
        res,
        new Exception(401, "Unauthorized"),
      );
    }

    const result = await this.userService.getMyInfo(userId);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async updateAvatar(req: Request, res: Response): Promise<Response> {
    if (!req.file) {
      return new HttpResponseDto().exception(
        res,
        new Exception(400, "Avatar file is required"),
      );
    }

    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return new HttpResponseDto().exception(
        res,
        new Exception(401, "Unauthorized"),
      );
    }

    const result = await this.userService.updateAvatar(userId, req.file);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }
}
