import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserController } from "./user.controller";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import {
  getUserByUserIdRequestSchema,
  getUsersRequestSchema,
  GetUsersRequestDto,
  getUsersRequestValidationSchema,
} from "./dtos/request";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { getUserResponseSchema } from "@/modules/user/dtos";
import { StatusCodes } from "http-status-codes";

const userController = new UserController();

export const userRegistry = new OpenAPIRegistry();

const router = express.Router({ mergeParams: true });
autoBindUtil(userController);

userRegistry.registerPath({
  method: "get",
  path: "/user/{userId}",
  tags: ["User"],
  request: getUserByUserIdRequestSchema,
  responses: createApiResponse(
    getUserResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get("/:userId", userController.getUserByUserId);

userRegistry.registerPath({
  method: "get",
  path: "/user",
  tags: ["User"],
  request: getUsersRequestSchema,
  responses: createApiResponse(
    getUserResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});


router.get("/",validateRequestMiddleware(getUsersRequestValidationSchema) ,userController.getAllUsers);

export const userRouter = router;
