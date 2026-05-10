import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { AuthController } from "./auth.controller";
import express from "express";
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import {
  registerRequestSchema,
  registerRequestValidationSchema,
} from "./dtos/requests/register.req";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { accountResDtoSchema } from "./dtos/responses/account.res";
import { StatusCodes } from "http-status-codes";
import {
  loginRequestSchema,
  loginRequestValidationSchema,
  sendOtpRequestSchema,
  sendOtpRequestValidationSchema,
} from "./dtos/requests";
import { loginResponseDtoSchema, logoutResponseSchema } from "./dtos/responses";
import z from "zod";
import {
  verifyRequestSchema,
  verifyRequestValidationSchema,
} from "./dtos/requests/verifyAcc.req";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { ProjectController } from "../projects/projects.controller";
import { projectResponseSchema } from "../projects/dtos/response/project.res";
import {
  createProjectRequestSchema,
  createProjectRequestValidationSchema,
} from "../projects/dtos/request/createProject.req";
import {
  resetPasswordRequestSchema,
  resetPasswordRequestValidationSchema,
} from "./dtos/requests/resetPass.req";
import {
  resetPasswordResponseSchema,
  verifyOtpResponseSchema,
} from "./dtos/responses";

export const authRegistry = new OpenAPIRegistry();

const authController = new AuthController();
const projectController = new ProjectController();
const router = express.Router({ mergeParams: true });
autoBindUtil(authController);
autoBindUtil(projectController);

authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: registerRequestSchema,
  responses: createApiResponse(
    accountResDtoSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/register",
  validateRequestMiddleware(registerRequestValidationSchema),
  authController.register,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: loginRequestSchema,
  responses: createApiResponse(loginResponseDtoSchema, "Success"),
});
router.post(
  "/login",
  validateRequestMiddleware(loginRequestValidationSchema),
  authController.login,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/sendOtp",
  tags: ["Auth"],
  request: sendOtpRequestSchema,
  responses: createApiResponse(z.null(), "Success"),
});
router.post(
  "/sendOtp",
  validateRequestMiddleware(sendOtpRequestValidationSchema),
  authController.sendOtp,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/verify",
  tags: ["Auth"],
  request: verifyRequestSchema,
  responses: createApiResponse(accountResDtoSchema, "Success"),
});
router.post(
  "/verify",
  validateRequestMiddleware(verifyRequestValidationSchema),
  authController.verify,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh-token",
  tags: ["Auth"],
  responses: createApiResponse(
    loginResponseDtoSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/refresh-token",
  authMiddleware.verifyRefreshToken,
  authController.refreshToken,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/create-project",
  tags: ["Auth"],
  request: createProjectRequestSchema,
  responses: createApiResponse(
    projectResponseSchema,
    "Success",
    StatusCodes.CREATED,
  ),
});
router.post(
  "/create-project",
  authMiddleware.verifyAccessToken,
  validateRequestMiddleware(createProjectRequestValidationSchema),
  projectController.createProject,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/verifyOtp",
  tags: ["Auth"],
  request: verifyRequestSchema,
  responses: createApiResponse(
    verifyOtpResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.post(
  "/verifyOtp",
  validateRequestMiddleware(verifyRequestValidationSchema),
  authController.verifyOtp,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/resetPassword",
  tags: ["Auth"],
  request: resetPasswordRequestSchema,
  responses: createApiResponse(
    resetPasswordResponseSchema,
    "Success",
    StatusCodes.OK,
  ),
});
router.post(
  "/resetPassword",
  validateRequestMiddleware(resetPasswordRequestValidationSchema),
  authController.resetPassword,
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(logoutResponseSchema, "Success", StatusCodes.OK),
});
router.post("/logout", authMiddleware.verifyAccessToken, authController.logout);

export const authRouter = router;
