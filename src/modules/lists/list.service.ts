import { BadRequest, Exception } from "@tsed/exceptions";
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
import { Prisma } from "@prisma/client";
import { GetListByIdRequestDto } from "./dtos/requests/getListById.req";
import { UpdateListRequestDto } from "./dtos/requests/updateList.req";
import { DeleteListRequestDto } from "./dtos/requests/delete.req";
import { ReorderListRequestDto } from "./dtos/requests/reorderList.req";
import { realtimeEventService } from "@/modules/realtime";

export class ListService {
  constructor(
    private readonly listRepository = new ListRepository(),
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
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto> | Exception> {
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
    const response = new ListResponseDto(created as any);

    // Emit list:created to board room after DB commit
    realtimeEventService.emitListCreated({
      boardId: createList.boardId,
      list: response,
      actorId: actorUserId,
    });

    return {
      success: true,
      data: response,
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

  async reorderLists(
    reorderListDto: ReorderListRequestDto,
    actorUserId?: string,
  ): Promise<HttpResponseBodySuccessDto<ListResponseDto[]> | Exception> {
    const { boardId, listIds } = reorderListDto;

    if (!Array.isArray(listIds) || listIds.length === 0) {
      throw new BadRequest("listIds is required");
    }

    // Dedupe + validate FE gửi không được trùng id
    const uniqueListIds = Array.from(new Set(listIds));
    if (uniqueListIds.length !== listIds.length) {
      throw new BadRequest("listIds contains duplicates");
    }

    // Kiểm tra listIds thuộc đúng board (chống reorder nhầm board)
    const listsInBoard = await this.listRepository.getListsByIds({
      boardId,
      listIds: uniqueListIds,
    });
    if (listsInBoard.length !== uniqueListIds.length) {
      // Không đủ record => listId không thuộc board hoặc không tồn tại
      throw new NotFoundException("List not found");
    }

    // Reorder đúng nghĩa là reorder toàn bộ active lists của board.
    // Nếu FE chỉ gửi một phần list thì BE gán lại order theo index của phần đó,
    // sẽ làm thứ tự tổng thể bị "đè" / xung đột.
    const totalActiveLists = await this.listRepository.countListsByBoardId(
      boardId,
    );
    if (uniqueListIds.length !== totalActiveLists) {
      throw new BadRequest(
        "listIds must contain all active lists of this board (to reorder correctly)",
      );
    }

    const step = 65536;
    const updates = uniqueListIds.map((id, index) => ({
      id,
      order: index * step,
    }));

    await this.listRepository.updateOrders(updates);

    const updatedLists = await this.listRepository.getListsByIds({
      boardId,
      listIds: uniqueListIds,
    });

    const sorted = updatedLists.sort((a, b) => a.order - b.order);

    const response = sorted.map((list) => new ListResponseDto(list as any)) as any;

    // Emit board:lists_reordered tới board room sau DB commit.
    // Snapshot đã sort theo order canonical; permission đã check ở middleware.
    realtimeEventService.emitBoardListsReordered({
      boardId,
      lists: response,
      actorId: actorUserId,
    });

    return {
      success: true,
      data: response,
    };
  }
}
