import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserController } from "./user.controller";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { uploadMiddleware } from "@/common/middlewares/upload.middleware";
import {
  getUserByUserIdRequestSchema,
  getUserByUserIdValidationSchema,
  getUsersRequestSchema,
  updateAvatarRequestBodySchema,
  updateAvatarRequestValidationSchema,
  getUsersRequestValidationSchema,
  changePasswordRequestSchema,
  changePasswordRequestValidationSchema,
} from "./dtos/request";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import {
  changPasswordResponseSchema,
  getUserResponseSchema,
  myInfomationResponseSchema,
  updateAvatarResponseSchema,
} from "@/modules/user/dtos";
import { StatusCodes } from "http-status-codes";

const userController = new UserController();

export const userRegistry = new OpenAPIRegistry();

const router = express.Router({ mergeParams: true });
autoBindUtil(userController);

userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  request: getUsersRequestSchema,
  responses: createApiResponse(
    getUserResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});

router.get(
  "/",
  validateRequestMiddleware(getUsersRequestValidationSchema),
  userController.getAllUsers,
);

userRegistry.registerPath({
  method: "get",
  path: "/user/me",
  tags: ["User"],
  responses: createApiResponse(
    myInfomationResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.get("/me", authMiddleware.verifyAccessToken, userController.getMyInfo);

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
router.get(
  "/:userId",
  validateRequestMiddleware(getUserByUserIdValidationSchema),
  userController.getUserByUserId,
);

userRegistry.registerPath({
  method: "patch",
  path: "/user/me/avatar",
  tags: ["User"],
  request: {
    body: updateAvatarRequestBodySchema,
  },
  responses: createApiResponse(
    updateAvatarResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/me/avatar",
  authMiddleware.verifyAccessToken,
  uploadMiddleware.single("avatar"),
  validateRequestMiddleware(updateAvatarRequestValidationSchema),
  userController.updateAvatar,
);

userRegistry.registerPath({
  method: "patch",
  path: "/user/me/password",
  tags: ["User"],
  request: changePasswordRequestSchema,
  responses: createApiResponse(
    changPasswordResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.patch(
  "/me/password",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(changePasswordRequestValidationSchema),
  userController.changePassword,
);

export const userRouter = router;
