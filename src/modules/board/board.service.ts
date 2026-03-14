import { Exception } from "@tsed/exceptions";
import { BoardRepository } from "./board.repository";
import { GetBoardRequestDto } from "./dtos/requests";
import { BoardResponseDto } from "./dtos/responses";
import {
  ConflictException,
  ForbiddenException,
  HttpResponseBodySuccessDto,
  InternalServerException,
  NotFoundException,
  PaginationDto,
  PaginationUtils,
} from "@/common";
import { GetAllBoardRequestDto } from "./dtos/requests/getAllBoard.req";
import { CreateBoardRequestDto } from "./dtos/requests/createBoard.req";
import { Prisma } from "@prisma/client";
import { RoleRepository } from "../roles/roles.repository";
import { BoardRole } from "@/common/enums/roles";
import { ProjectMemberRepo } from "../projectMember/projectMember.repository";
import { ProjectsRepository } from "../projects/projects.repository";
import { BoardMemberRepository } from "../boardMember/boardMember.repository";

export class BoardService {
  constructor(
    private readonly boardRepository = new BoardRepository(),
    private readonly rolesRepository = new RoleRepository(),
    private readonly projectMemberRepository = new ProjectMemberRepo(),
    private readonly projectRepository = new ProjectsRepository(),
    private readonly boardMemberRepository = new BoardMemberRepository(),
  ) {}

  async getBoardById(
    getBoardById: GetBoardRequestDto,
  ): Promise<HttpResponseBodySuccessDto<BoardResponseDto> | Exception> {
    const { boardId, name, status } = getBoardById;
    const board = await this.boardRepository.getBoardById({
      id: boardId,
      name: name,
      status: status,
    });
    if (!board) {
      throw new NotFoundException("Board not found");
    }

    return {
      success: true,
      data: new BoardResponseDto(board),
    };
  }

  async getAllBoards(
    getAllBoard: GetAllBoardRequestDto,
    paginationDto: PaginationDto,
  ): Promise<HttpResponseBodySuccessDto<BoardResponseDto[]>> {
    const { projectId, name, status } = getAllBoard;
    const paginationUtils = new PaginationUtils().extractSkipTakeFromPagination(
      paginationDto,
    );
    const { skip, take } = paginationUtils;

    const [boards, totalBoards] = await this.boardRepository.getBoards({
      projectId: projectId,
      name: name,
      status: status,
      skip: skip,
      take: take,
    });

    const boardResponse = boards.map((board) => new BoardResponseDto(board));

    return {
      success: true,
      data: boardResponse as any,
      pagination:
        paginationUtils.convertPaginationResponseDtoFromTotalRecords(
          totalBoards,
        ),
    };
  }

  async createBoard(
    createBoardDto: CreateBoardRequestDto,
    projectId: string,
  ): Promise<HttpResponseBodySuccessDto<BoardResponseDto> | Exception> {
    const existingProject = await this.projectRepository.getProject({
      id: projectId,
    });
    if (!existingProject) {
      throw new NotFoundException("project not found");
    }
    const checkProjectMember =
      await this.projectMemberRepository.checkMemberOfProject(
        projectId,
        createBoardDto.userId,
      );
    if (!checkProjectMember) {
      throw new ForbiddenException();
    }
    const existingBoard = await this.boardRepository.getBoardById({
      name: createBoardDto.name,
      projectId: createBoardDto.projectId,
    });
    if (existingBoard) {
      throw new ConflictException("board already exist");
    }

    const createBoard: Prisma.boardsCreateInput = {
      name: createBoardDto.name,
      description: createBoardDto.description,
      project: {
        connect: { id: createBoardDto.projectId },
      },
      user: {
        connect: { id: createBoardDto.userId },
      },
    };

    const newBoard = await this.boardRepository.createBoard({
      board: createBoard,
    });

    const adminBoad = await this.rolesRepository.findRolesName(
      BoardRole.BOARD_ADMIN,
    );
    if (!adminBoad) {
      throw new InternalServerException();
    }
    const userId = createBoardDto.userId;
    const boardId = newBoard.id;
    if (!userId || !boardId) {
      throw new InternalServerException();
    }
    await this.boardMemberRepository.addMemberOfBoard(
      userId,
      boardId,
      adminBoad.id,
    );

    return {
      success: true,
      data: new BoardResponseDto(newBoard as any),
    }
  }
}
