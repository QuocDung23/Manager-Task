import { Exception } from "@tsed/exceptions";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodSchema } from "zod";

import { OptionalException } from "../exceptions";

export class ZodValidationSchema {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  cookies?: ZodSchema;
  headers?: ZodSchema | ZodSchema[];
  [key: string]: ZodSchema | ZodSchema[] | undefined;
}

export const validateRequestMiddleware = (schema: ZodValidationSchema) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Exception => {
    try {
      for (const key in schema) {
        const zodSchema: ZodSchema | ZodSchema[] | undefined =
          schema[key as keyof ZodValidationSchema];
        const requestValue = (req as any)[key];

        if (requestValue === undefined || requestValue === null) {
          continue;
        }

        if (zodSchema && !Array.isArray(zodSchema)) {
          zodSchema.parse(requestValue);
        } else {
          (zodSchema as ZodSchema[]).forEach((zodSchema) => {
            zodSchema.parse(requestValue);
          });
        }
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessage = err.issues
          .map((e) => `${e.path.join(", ")} ${e.message}`)
          .join("; ");
        throw new OptionalException(StatusCodes.BAD_REQUEST, errorMessage);
      }
      throw new OptionalException(
        StatusCodes.BAD_REQUEST,
        err instanceof Error ? err.message : "Invalid request",
      );
    }
  };
};
