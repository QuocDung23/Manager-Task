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
import { loginResponseDtoSchema } from "./dtos/responses";
import z from "zod";
import {
  verifyRequestSchema,
  verifyRequestValidationSchema,
} from "./dtos/requests/verifyOtp.req";
import authMiddleware from "@/common/middlewares/auth.middleware";
import { ProjectController } from "../projects/projects.controller";
import { projectResponseSchema } from "../projects/dtos/response/project.res";
import { createProjectRequestSchema, createProjectRequestValidationSchema } from "../projects/dtos/request/createProject.req";
import { UserPermissions } from "@/common/enums/permissions";

export const authRegistry = new OpenAPIRegistry();

const authController = new AuthController();
const projectController = new ProjectController()
const router = express.Router({ mergeParams: true });
autoBindUtil(authController);
autoBindUtil(projectController)

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
	method: 'post',
	path: '/auth/refresh-token',
	tags: ['Auth'],
	responses: createApiResponse(loginResponseDtoSchema, 'Success', StatusCodes.CREATED),
});
router.post(
	'/refresh-token',
	authMiddleware.verifyRefreshToken,
	authController.refreshToken,
);

authRegistry.registerPath({
  method: 'post',
  path: '/auth/create-project',
  tags: ['Auth'],
  request: createProjectRequestSchema,
  responses: createApiResponse(projectResponseSchema, 'Success', StatusCodes.CREATED),   
})
router.post(
  '/create-project',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifySystemPermission(UserPermissions.CREATE_PROJECT),
  validateRequestMiddleware(createProjectRequestValidationSchema),
  projectController.createProject,
)

export const authRouter = router;
