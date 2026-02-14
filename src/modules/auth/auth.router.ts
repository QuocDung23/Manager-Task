import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { AuthController } from "./auth.controller";
import express from 'express';
import { autoBindUtil, validateRequestMiddleware } from "@/common";
import { registerRequestSchema, registerRequestValidationSchema } from "./dtos/requests/register.req";
import { createApiResponse } from "@/swagger/openAPIResponseBuilders";
import { accountResDtoSchema } from "./dtos/responses/account.res";
import { StatusCodes } from "http-status-codes";

export const authRegistry = new OpenAPIRegistry()

const authController = new AuthController()
const router = express.Router({mergeParams: true})
autoBindUtil(authController)

authRegistry.registerPath({
	method: 'post',
	path: '/auth/register',
	tags: ['Auth'],
	request: registerRequestSchema,
	responses: createApiResponse(
		accountResDtoSchema,
		'Success',
		StatusCodes.CREATED,
	),
});
router.post('/register', validateRequestMiddleware(registerRequestValidationSchema),authController.register)
export const authRouter = router;
