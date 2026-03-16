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
import authMiddleware from "@/common/middlewares/auth.middleware";
import { BoardPermissions, ProjectPermissions } from "@/common/enums/permissions";
import { getBoardByIdRequestValidationSchema, getBoardRequestSchema } from "./dtos/requests/getBoard.req";
import { BoardController } from "./board.controller";
import { updateBoardRequestSchema, updateBoardRequestValidationSchema } from "./dtos/requests/updateBoard.req";
import { deleteBoardRequestSchema, deleteBoardRequestValidationSchema } from "./dtos/requests/deleteBoard.req";
import { addMemberBoardRequestSchema, addMemberBoardRequestValidationSchema } from "./dtos/requests/addMemberBoard.req";

export const boardRegistry = new OpenAPIRegistry();
const boardController = new BoardController();
const router = express.Router({ mergeParams: true });
autoBindUtil(boardController);

boardRegistry.registerPath({
  method: "get",
  path: "/board/{projectId}/getAlls",
  tags: ["Boards"],
  request: getAllBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/:projectId/getAlls",
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
  method: "put",
  path: "/board/{boardId}/update",
  tags: ["Boards"],
  request: updateBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.put(
  '/:boardId/update',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.UPDATE_BOARD),
  validateRequestMiddleware(updateBoardRequestValidationSchema),
  boardController.updateBoard,
)

boardRegistry.registerPath({
  method: 'delete',
  path: '/board/{boardId}/delete',
  tags: ['Boards'],
  request: deleteBoardRequestSchema,
  responses: createApiResponse(boardResponseSchema, 'Success', StatusCodes.OK),
})
router.delete(
  '/:boardId/delete',
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
  responses: createApiResponse(boardResponseSchema, "Success", StatusCodes.OK),
});
router.post(
  "/:boardId/members",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.ADD_MEMBER_BOARD),
  validateRequestMiddleware(addMemberBoardRequestValidationSchema),
  boardController.addMemberToBoard,
);

export const boardRouter = router;
