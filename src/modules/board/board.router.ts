import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import {
  getAllBoardRequestSchema,
  getAllBoardRequestValidationSchema,
} from "./dtos/requests/getAllBoard.req";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { StatusCodes } from "http-status-codes";
import { boardResponseSchema } from "./dtos/responses/board.res";
import { boardMemberResponseSchema } from "./dtos/responses/boardMember.res";
import authMiddleware from "@/common/middlewares/auth.middleware";
import {
  BoardPermissions,
  ProjectPermissions,
} from "@/common/enums/permissions";
import {
  getBoardByIdRequestValidationSchema,
  getBoardRequestSchema,
} from "./dtos/requests/getBoard.req";
import { BoardController } from "./board.controller";
import {
  updateBoardRequestSchema,
  updateBoardRequestValidationSchema,
} from "./dtos/requests/updateBoard.req";
import {
  deleteBoardRequestSchema,
  deleteBoardRequestValidationSchema,
} from "./dtos/requests/deleteBoard.req";
import {
  addMemberBoardRequestSchema,
  addMemberBoardRequestValidationSchema,
} from "./dtos/requests/addMemberBoard.req";
import {
  getBoardMembersRequestSchema,
  getBoardMembersRequestValidationSchema,
} from "./dtos/requests/getBoardMembers.req";
import { ListController } from "../lists/list.controller";
import {
  createListRequestSchema,
  createListRequestValidationSchema,
} from "../lists/dtos/requests/createList.req";
import { listResponseSchema } from "../lists/dtos";
import { z } from "zod";

export const boardRegistry = new OpenAPIRegistry();
const boardController = new BoardController();
const listController = new ListController();
const router = express.Router({ mergeParams: true });
autoBindUtil(boardController);
autoBindUtil(listController);

boardRegistry.registerPath({
  method: "get",
  path: "/board",
  tags: ["Boards"],
  request: getAllBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyProjectPermission(ProjectPermissions.VIEW_PROJECT),
  validateRequestMiddleware(getAllBoardRequestValidationSchema),
  boardController.getAllBoards,
);

boardRegistry.registerPath({
  method: "get",
  path: "/board/{boardId}",
  tags: ["Boards"],
  request: getBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/:boardId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.VIEW_BOARD),
  validateRequestMiddleware(getBoardByIdRequestValidationSchema),
  boardController.getBoardById,
);

boardRegistry.registerPath({
  method: "patch",
  path: "/board/{boardId}",
  tags: ["Boards"],
  request: updateBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.patch(
  "/:boardId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.UPDATE_BOARD),
  validateRequestMiddleware(updateBoardRequestValidationSchema),
  boardController.updateBoard,
);

boardRegistry.registerPath({
  method: "delete",
  path: "/board/{boardId}",
  tags: ["Boards"],
  request: deleteBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:boardId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.DELETE_BOARD),
  validateRequestMiddleware(deleteBoardRequestValidationSchema),
  boardController.deleteBoard,
);

boardRegistry.registerPath({
  method: "post",
  path: "/board/{boardId}/members",
  tags: ["Boards"],
  request: addMemberBoardRequestSchema,
  responses: createApiResponse(
    boardResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:boardId/members",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.ADD_MEMBER_BOARD),
  validateRequestMiddleware(addMemberBoardRequestValidationSchema),
  boardController.addMemberToBoard,
);

// GET /board/:boardId/members - lấy active members của board (kèm user info).
boardRegistry.registerPath({
  method: "get",
  path: "/board/{boardId}/members",
  tags: ["Boards"],
  request: getBoardMembersRequestSchema,
  responses: createApiResponse(
    z.array(boardMemberResponseSchema),
    "Success",
    StatusCodes.OK,
  ),
});
router.get(
  "/:boardId/members",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.VIEW_BOARD),
  validateRequestMiddleware(getBoardMembersRequestValidationSchema),
  boardController.getBoardMembers,
);

boardRegistry.registerPath({
  method: "post",
  path: "/board/{boardId}/lists",
  tags: ["Boards"],
  request: createListRequestSchema,
  responses: createApiResponse(
    listResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/:boardId/lists",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.CREATE_LIST),
  validateRequestMiddleware(createListRequestValidationSchema),
  listController.createList,
);

export const boardRouter = router;
