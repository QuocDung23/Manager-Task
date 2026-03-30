import { Request, Response } from "express";
import { ListService } from "./list.service";
import { Exception } from "@tsed/exceptions";
import { HttpResponseDto, PaginationDto } from "@/common";
import { GetAllListRequestDto } from "./dtos/requests/getAllList.req";
import { CreateListRequestDto } from "./dtos/requests/createList.req";
import { GetListByIdRequestDto } from "./dtos/requests/getListById.req";
import { UpdateListRequestDto } from "./dtos/requests/updateList.req";
import { DeleteListRequestDto } from "./dtos/requests/delete.req";
import { ReorderListRequestDto } from "./dtos/requests/reorderList.req";

export class ListController {
  constructor(private readonly listService = new ListService()) {}

  async getAllLists(req: Request, res: Response): Promise<Response> {
    try {
      const boardId = req.params.boardId as string;

      const getAllList = new GetAllListRequestDto({
        ...(req.query as any),
        boardId,
      } as GetAllListRequestDto);

      const pagination: PaginationDto = new PaginationDto(req.query);
      const result = await this.listService.getAllLists(getAllList, pagination);

      if (result instanceof Exception) {
        return new HttpResponseDto().exception(res, result);
      }

      return new HttpResponseDto().success(res, result);
    } catch (error) {
      return new HttpResponseDto().exception(res, error as Exception);
    }
  }

  async getListById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string;

    const dto = new GetListByIdRequestDto({ id } as GetListByIdRequestDto);
    const result = await this.listService.getListById(dto);

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async createList(req: Request, res: Response): Promise<Response> {
    const boardId = req.params.boardId as string;

    const payload = {
      ...req.body,
      boardId,
    };

    const dto = new CreateListRequestDto(payload as CreateListRequestDto);
    const result = await this.listService.createList(dto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().created(res, result);
  }

  async updateList(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string;
    const payload = {
      ...req.body,
      id,
    };

    const dto = new UpdateListRequestDto(payload as UpdateListRequestDto);
    const result = await this.listService.updateList(dto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async deleteList(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string;
    const dto = new DeleteListRequestDto({ id } as DeleteListRequestDto);
    const result = await this.listService.deleteList(dto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async reorderLists(req: Request, res: Response): Promise<Response> {
    const boardId = req.params.boardId as string;

    const reorderListDto = new ReorderListRequestDto({
      ...(req.body as any),
      boardId,
    } as ReorderListRequestDto);

    const result = await this.listService.reorderLists(reorderListDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }
}
