import { Exception } from "@tsed/exceptions";
import { BoardRepository } from "./board.repository";
import { GetBoardRequestDto } from "./dtos/requests";
import { BoardResponseDto } from "./dtos/responses";
import { BoardMemberResponseDto } from "./dtos/responses/boardMember.res";
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
import { UpdateBoardRequestDto } from "./dtos/requests/updateBoard.req";
import { DeleteBoardRequestDto } from "./dtos/requests/deleteBoard.req";
import { AddMemberBoardRequestDto } from "./dtos/requests/addMemberBoard.req";
import { realtimeEventService } from "@/modules/realtime/realtime-event.service";

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

    const boardDto = new BoardResponseDto(newBoard as any);
    realtimeEventService.emitBoardCreated({
      projectId,
      board: boardDto,
      actorId: userId,
    });

    return {
      success: true,
      data: boardDto,
    };
  }

  async updateBoard(
    updateBoard: UpdateBoardRequestDto,
  ): Promise<HttpResponseBodySuccessDto<BoardResponseDto> | Exception> {
    const existingBoard = await this.boardRepository.getBoardById({
      id: updateBoard.boardId,
    });
    if (!existingBoard) {
      throw new NotFoundException("Board not found");
    }

    const checkMember = await this.boardMemberRepository.checkMemberOfBoard(
      updateBoard.boardId,
      updateBoard.userId,
    );
    if (!checkMember) {
      throw new ForbiddenException();
    }

    const updateBoarData: Prisma.boardsUpdateInput = {
      name: updateBoard.name,
      description: updateBoard.description,
    };

    const updatedBoard = await this.boardRepository.updateBoard({
      id: updateBoard.boardId,
      board: updateBoarData,
    });

    const boardDto = new BoardResponseDto(updatedBoard);
    realtimeEventService.emitBoardUpdated({
      projectId: existingBoard.projectId,
      boardId: updateBoard.boardId,
      board: boardDto,
      actorId: updateBoard.userId,
    });

    return {
      success: true,
      data: boardDto,
    };
  }

  async deleteBoard(
    deleteBoard: DeleteBoardRequestDto,
  ): Promise<HttpResponseBodySuccessDto<BoardResponseDto> | Exception> {
    const existingBoard = await this.boardRepository.getBoardById({
      id: deleteBoard.boardId,
    });
    if (!existingBoard) {
      throw new NotFoundException("Board not found");
    }

    const checkMember = await this.boardMemberRepository.checkMemberOfBoard(
      deleteBoard.boardId,
      deleteBoard.userId,
    );
    if (!checkMember) {
      throw new ForbiddenException();
    }

    const deletedBoard = await this.boardRepository.deleteBoard({
      id: deleteBoard.boardId,
      userId: deleteBoard.userId,
    });

    const boardDto = new BoardResponseDto(deletedBoard);
    realtimeEventService.emitBoardDeleted({
      projectId: deletedBoard.projectId,
      boardId: deleteBoard.boardId,
      board: boardDto,
      actorId: deleteBoard.userId,
    });

    return {
      success: true,
      data: boardDto,
    };
  }

  async addMemberToBoard(
    addMemberBoardDto: AddMemberBoardRequestDto,
    actorId?: string | null,
  ): Promise<HttpResponseBodySuccessDto<null> | Exception> {
    const { boardId, userId } = addMemberBoardDto;

    const existingBoard = await this.boardRepository.getBoardById({
      id: boardId,
    });
    if (!existingBoard) {
      throw new NotFoundException("Board not found");
    }

    const isProjectMember =
      await this.projectMemberRepository.checkMemberOfProject(
        existingBoard.projectId,
        userId,
      );
    if (!isProjectMember) {
      throw new ForbiddenException();
    }

    const isBoardMember = await this.boardMemberRepository.checkMemberOfBoard(
      boardId,
      userId,
    );
    if (isBoardMember) {
      throw new ConflictException("User already a board member");
    }

    const boardMemberRole = await this.rolesRepository.findRolesName(
      BoardRole.BOARD_MEMBER,
    );
    if (!boardMemberRole) {
      throw new InternalServerException();
    }

    await this.boardMemberRepository.addMemberOfBoard(
      userId,
      boardId,
      boardMemberRole.id,
    );

    const memberRecord =
      await this.boardMemberRepository.getActiveBoardMemberWithUser(
        boardId,
        userId,
      );
    if (memberRecord) {
      realtimeEventService.emitBoardMemberAdded({
        projectId: existingBoard.projectId,
        boardId,
        member: new BoardMemberResponseDto({
          id: memberRecord.id,
          userId: memberRecord.userId,
          boardId: memberRecord.boardId,
          roleId: memberRecord.roleId,
          status: memberRecord.status,
          user: memberRecord.user,
        }),
        actorId: actorId ?? null,
      });
    }

    return {
      success: true,
      data: null,
    };
  }

  async getBoardMembers(
    boardId: string,
  ): Promise<HttpResponseBodySuccessDto<BoardMemberResponseDto[]>> {
    const existingBoard = await this.boardRepository.getBoardById({
      id: boardId,
    });
    if (!existingBoard) {
      throw new NotFoundException("Board not found");
    }

    const members =
      await this.boardMemberRepository.getActiveBoardMembersWithUser(boardId);
    const data = members.map(
      (m) =>
        new BoardMemberResponseDto({
          id: m.id,
          userId: m.userId,
          boardId: m.boardId,
          roleId: m.roleId,
          status: m.status,
          user: m.user,
        }),
    );

    return {
      success: true,
      data,
    };
  }
}
