import { NextFunction, Request, Response } from "express";
import { Exception } from "@tsed/exceptions";
import { HttpResponseDto } from "../dtos/httpResponse.dto";

const httpResponse = new HttpResponseDto();

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof Exception) {
    httpResponse.exception(res, err);
    return;
  }

  console.error("[errorHandler] Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
