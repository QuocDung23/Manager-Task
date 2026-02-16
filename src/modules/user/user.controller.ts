import { Exception } from "@tsed/exceptions";
import { UserServicer } from "./user.service";
import { Request, Response } from "express";
import { GetUserByUserIdRequestDto, GetUsersRequestDto } from "./dtos";
import { HttpResponseDto, PaginationDto } from "@/common";

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

    const result = await this.userService.getAllUsers(getUsersRequest, pagination);
    if (result instanceof Exception) {
        return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
}

}
