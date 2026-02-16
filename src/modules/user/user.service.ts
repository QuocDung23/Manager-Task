import {
  HttpResponseBodySuccessDto,
  NotFoundException,
  PaginationDto,
} from "@/common";
import {
  GetUserByUserIdRequestDto,
  GetUserResponseDto,
  GetUsersRequestDto,
} from "./dtos";
import { UserRepository } from "./user.repository";
import { PaginationUtils } from "@/common/utils/pagination.utils";

export class UserServicer {
  constructor(private readonly userRepository = new UserRepository()) {}

  async getUserByUserId(
    getUserByUserIdRequestDto: GetUserByUserIdRequestDto,
  ): Promise<HttpResponseBodySuccessDto<GetUserResponseDto>> {
    const { userId, status } = getUserByUserIdRequestDto;
    const user = await this.userRepository.findUser({
      userId: userId,
      status: status,
    });

    if (!user) {
      throw new NotFoundException("userId");
    }

    return {
      data: new GetUserResponseDto(user),
    };
  }

  async getAllUsers(
    getUsersRequestDto: GetUsersRequestDto,
    paginationDto: PaginationDto,
  ): Promise<HttpResponseBodySuccessDto<GetUserResponseDto[]>> {
    const { name, status } = getUsersRequestDto;
    const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
      paginationDto,
    );

    const [user, totalUser] = await this.userRepository.findUsers({
      name: name as string,
      status: status,
      skip: 1,
      take: 10,
    });

    const userRespone = user.map((user) => new GetUserResponseDto(user));
    return {
      success: true,
      data: userRespone,
      pagination:
        paginationUtils.convertPaginationResponseDtoFromTotalRecords(totalUser),
    };
  }

  async getMyInfo() {
	
  }
}
