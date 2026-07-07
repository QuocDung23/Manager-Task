import { Request, Response } from "express";
import { BoardService } from "./board.service";
import { CreateBoardRequestDto } from "./dtos/requests/createBoard.req";
import { Exception } from "@tsed/exceptions";
import { HttpResponseDto } from "@/common/dtos/httpResponse.dto";
import { GetAllBoardRequestDto } from "./dtos/requests/getAllBoard.req";
import { PaginationDto } from "@/common";
import { GetBoardRequestDto } from "./dtos/requests/getBoard.req";
import { UpdateBoardRequestDto } from "./dtos/requests/updateBoard.req";
import { DeleteBoardRequestDto } from "./dtos/requests/deleteBoard.req";
import { AddMemberBoardRequestDto } from "./dtos/requests/addMemberBoard.req";

export class BoardController {
  constructor(private readonly boardService = new BoardService()) {}

  async getAllBoards(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const projectId = req.params.projectId as string;
    const getAllBoard = new GetAllBoardRequestDto({
      ...(req.query as any),
      projectId,
    } as GetAllBoardRequestDto);
    const pagination: PaginationDto = new PaginationDto(req.query);
    const result = await this.boardService.getAllBoards(
      getAllBoard,
      pagination,
    );
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async getBoardById(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const projectId = req.params.projectId as string;
    const boardId = req.params.boardId as string;
    const getBoard = new GetBoardRequestDto({
      boardId,
      projectId,
      userId: user.id,
    } as GetBoardRequestDto);
    const result = await this.boardService.getBoardById(getBoard);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async createBoard(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const projectId = req.params.projectId as string;

    const payload = {
      ...req.body,
      userId: user.id,
      projectId,
    };

    const boardDto = new CreateBoardRequestDto(payload);
    const result = await this.boardService.createBoard(boardDto, projectId);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().created(res, result);
  }

  async updateBoard(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const boardId = req.params.boardId as string;

    const payload = {
      ...req.body,
      userId: user.id,
      boardId,
    };

    const updateBoardDto = new UpdateBoardRequestDto(payload);
    const result = await this.boardService.updateBoard(updateBoardDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async deleteBoard(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const boardId = req.params.boardId as string;

    const payload = {
      boardId,
      userId: user.id,
    };

    const deleteBoardDto = new DeleteBoardRequestDto(payload);
    const result = await this.boardService.deleteBoard(deleteBoardDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async addMemberToBoard(req: Request, res: Response): Promise<Response> {
    const boardId = req.params.boardId as string;
    const { userId } = req.body as { userId: string };

    const payload = {
      boardId,
      userId,
    };

    const addMemberBoardDto = new AddMemberBoardRequestDto(
      payload as AddMemberBoardRequestDto,
    );
    const result = await this.boardService.addMemberToBoard(addMemberBoardDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().success(res, result);
  }

  async getBoardMembers(req: Request, res: Response): Promise<Response> {
    const boardId = req.params.boardId as string;
    const result = await this.boardService.getBoardMembers(boardId);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }
}
