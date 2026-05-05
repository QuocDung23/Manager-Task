import {
  HttpResponseBodySuccessDto,
  NotFoundException,
  PaginationDto,
} from "@/common";
import {
  GetUserByUserIdRequestDto,
  GetUserResponseDto,
  GetUsersRequestDto,
  MyInfomationResDto,
} from "./dtos";
import { UserRepository } from "./user.repository";
import { PaginationUtils } from "@/common/utils/pagination.utils";
import { CloudinaryService } from "@/common/service/cloudinary.service";

export class UserServicer {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly cloudinaryService = new CloudinaryService()
  ) {}

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
    const { name, email, status } = getUsersRequestDto;
    const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
      paginationDto,
    );
    const { skip, take } = paginationUtils;

    const [user, totalUser] = await this.userRepository.findUsers({
      name: name as string,
      email: email as string,
      status: status,
      skip,
      take,
    });

    const userRespone = user.map((user) => new GetUserResponseDto(user));
    return {
      success: true,
      data: userRespone,
      pagination:
        paginationUtils.convertPaginationResponseDtoFromTotalRecords(totalUser),
    };
  }

  async getMyInfo(
    userId: string,
  ): Promise<HttpResponseBodySuccessDto<MyInfomationResDto>> {
    const user = await this.userRepository.findUser({ userId });
    if (!user) {
      throw new NotFoundException("userId");
    }

    return {
      success: true,
      data: new MyInfomationResDto(user),
    };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findUser({ userId });
    if (!user) {
      throw new NotFoundException("userId");
    }

    const updateAvatar = await this.cloudinaryService.uploadAvatar(file, userId);

    const updatedUser = await this.userRepository.updateUser({
      userId,
      user: {
        avatar: updateAvatar.secure_url,
      },
    });

    return {
      success: true,
      data: { avatar: updatedUser.avatar },
    };
  }
}
