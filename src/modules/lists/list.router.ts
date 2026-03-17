import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { StatusCodes } from "http-status-codes";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { BoardPermissions, ListPermissions } from "@/common/enums/permissions";
import { ListController } from "./list.controller";
import { listResponseSchema } from "./dtos/responses/list.res";
import {
  getAllListRequestSchema,
  getAllListRequestValidationSchema,
} from "./dtos/requests/getAllList.req";
import {
  getListByIdRequestSchema,
  getListByIdRequestValidationSchema,
} from "./dtos/requests/getListById.req";
import {
  deleteListRequestSchema,
  deleteListRequestValidationSchema,
  updateListRequestSchema,
  updateListRequestValidationSchema,
} from "./dtos";

export const listRegistry = new OpenAPIRegistry();
const listController = new ListController();
const router = express.Router({ mergeParams: true });
autoBindUtil(listController);

listRegistry.registerPath({
  method: "get",
  path: "/list/{boardId}/getAllList",
  tags: ["Lists"],
  request: getAllListRequestSchema,
  responses: createApiResponse(listResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/:boardId/getAllList",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyBoardPermission(BoardPermissions.VIEW_BOARD),
  validateRequestMiddleware(getAllListRequestValidationSchema),
  listController.getAllLists,
);

listRegistry.registerPath({
  method: "get",
  path: "/list/{id}/getListById",
  tags: ["Lists"],
  request: getListByIdRequestSchema,
  responses: createApiResponse(listResponseSchema, "Success", StatusCodes.OK),
});
router.get(
  "/:id/getListById",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyListPermission(ListPermissions.VIEW_LIST),
  validateRequestMiddleware(getListByIdRequestValidationSchema),
  listController.getListById,
);

listRegistry.registerPath({
  method: "put",
  path: "/list/{id}/update",
  tags: ["Lists"],
  request: updateListRequestSchema,
  responses: createApiResponse(listResponseSchema, "Success", StatusCodes.OK),
});
router.put(
  "/:id/update",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyListPermission(ListPermissions.UPDATE_LIST),
  validateRequestMiddleware(updateListRequestValidationSchema),
  listController.updateList,
);

listRegistry.registerPath({
  method: "delete",
  path: "/list/{id}/delete",
  tags: ["Lists"],
  request: deleteListRequestSchema,
  responses: createApiResponse(listResponseSchema, "Success", StatusCodes.OK),
});
router.delete(
  "/:id/delete",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyListPermission(ListPermissions.DELETE_LIST),
  validateRequestMiddleware(deleteListRequestValidationSchema),
  listController.deleteList,
);

export const listRouter = router;
