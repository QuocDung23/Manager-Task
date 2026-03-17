import { Exception } from "@tsed/exceptions";
import { ListRepository } from "./list.repository";
import { GetAllListRequestDto } from "./dtos/requests/getAllList.req";
import { ListResponseDto } from "./dtos/responses/list.res";
import {
  HttpResponseBodySuccessDto,
  NotFoundException,
  PaginationDto,
  PaginationUtils,
} from "@/common";
import { CreateListRequestDto } from "./dtos/requests/createList.req";
import { BoardRepository } from "../board/board.repository";
import { Prisma } from "@prisma/client";
import { GetListByIdRequestDto } from "./dtos/requests/getListById.req";
import { UpdateListRequestDto } from "./dtos/requests/updateList.req";
import { DeleteListRequestDto } from "./dtos/requests/delete.req";

export class ListService {
  constructor(
    private readonly listRepository = new ListRepository(),
    private readonly boardRepository = new BoardRepository(),
  ) {}

  async getAllLists(
    getAllList: GetAllListRequestDto,
    paginationDto: PaginationDto,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto[]> | Exception> {
    const { boardId, name, status } = getAllList;

    const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
      paginationDto,
    );
    const { skip, take } = paginationUtils;

    const [lists, totalLists] = await this.listRepository.getLists({
      boardId,
      name,
      status,
      skip,
      take,
    });

    const listResponse = lists.map((list) => new ListResponseDto(list as any));

    return {
      success: true,
      data: listResponse as any,
      pagination:
        paginationUtils.convertPaginationResponseDtoFromTotalRecords(
          totalLists,
        ),
    };
  }

  async getListById(
    getListById: GetListByIdRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto> | Exception> {
    const list = await this.listRepository.getListById(getListById.id);
    if (!list) {
      throw new NotFoundException("List not found");
    }

    return {
      success: true,
      data: new ListResponseDto(list as any),
    };
  }

  async createList(
    createList: CreateListRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto> | Exception> {
    const board = await this.boardRepository.getBoardById({
      id: createList.boardId,
    });
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    //chọn 65536 vì nó = 2^16 đủ lớn để có thể drag drop ôn định
    const order =
      (await this.listRepository.getMaxOrder(createList.boardId)) + 65536;

    const data: Prisma.listsCreateInput = {
      name: createList.name,
      description: createList.description ?? "",
      order,
      board: { connect: { id: createList.boardId } },
    };

    const created = await this.listRepository.createList(data);

    return {
      success: true,
      data: new ListResponseDto(created as any),
    };
  }

  async updateList(
    updateListDto: UpdateListRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto> | Exception> {
    const list = await this.listRepository.getListById(updateListDto.id);
    if (!list) {
      throw new NotFoundException("List not found");
    }

    const updateData: Prisma.listsUpdateInput = {
      name: updateListDto.name,
      description: updateListDto.description,
      ...(updateListDto.order !== undefined && { order: updateListDto.order }),
    };

    const updateList = await this.listRepository.updateList({
      id: updateListDto.id,
      list: updateData,
    });

    return {
      success: true,
      data: new ListResponseDto(updateList),
    };
  }

  async deleteList(
    deleteListDto: DeleteListRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto> | Exception> {
    const list = await this.listRepository.getListById(deleteListDto.id);
    if (!list) {
      throw new NotFoundException("List not found");
    }

    const deleteList = await this.listRepository.deleteList(deleteListDto.id);

    return {
      success: true,
      data: new ListResponseDto(deleteList),
    };
  }
}
