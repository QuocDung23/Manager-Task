import { Exception } from "@tsed/exceptions";
import { AuthService } from "./auth.service";
import { HttpResponseDto } from "@/common";
import { AccountResDto } from "./dtos/responses/account.res";
import { Request, Response } from "express";
import {
  LoginRequestDto,
  RegisterRequestDto,
  SendOtpRequestDto,
} from "./dtos/requests";
import { VerifyRequestDto } from "./dtos/requests/verifyAcc.req";
import { MyInfomationResDto } from "../user/dtos/response/myInfo.res";
import { ChangePasswordRequestDto } from "../user/dtos";
import { ResetPasswordRequestDto } from "./dtos/requests/resetPass.req";
import { appEnv } from "@/configs";

function getAuthCookieOptions(maxAgeMs: number) {
  const isProduction = appEnv.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeMs,
  };
}

function buildAccessCookie() {
  return getAuthCookieOptions(30 * 60 * 1000); // 30 minutes
}

function buildRefreshCookie() {
  return getAuthCookieOptions(7 * 24 * 60 * 60 * 1000); // 7 days
}

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  async register(req: Request, res: Response): Promise<Response> {
    const registerDto = req.body as RegisterRequestDto;
    const result = await this.authService.register(registerDto);

    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    return new HttpResponseDto().created<AccountResDto>(res, result);
  }

  async login(req: Request, res: Response): Promise<Response> {
    const loginDto = req.body as LoginRequestDto;
    const result = await this.authService.login(loginDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    if (result.data) {
      const accessOptions = buildAccessCookie();
      const refreshOptions = buildRefreshCookie();
      res.cookie("accessToken", result.data.accessToken, accessOptions);
      res.cookie("refreshToken", result.data.refreshToken, refreshOptions);
    }

    return new HttpResponseDto().success(res, result);
  }

  async sendOtp(req: Request, res: Response): Promise<Response> {
    const email = new SendOtpRequestDto(req.body);
    const result = await this.authService.sendOtp(email);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success<null>(res, result);
  }

  async verify(req: Request, res: Response): Promise<Response> {
    const verifyRequestDto = new VerifyRequestDto(req.body);
    const result = await this.authService.verify(verifyRequestDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const myInformation = (req as any).user as MyInfomationResDto;
    const result = await this.authService.refreshToken(myInformation);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }

    if (result.data) {
      const accessOptions = buildAccessCookie();
      const refreshOptions = buildRefreshCookie();
      res.cookie("accessToken", result.data.accessToken, accessOptions);
      res.cookie("refreshToken", result.data.refreshToken, refreshOptions);
    }

    return new HttpResponseDto().created(res, result);
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const dto = new VerifyRequestDto(req.body);
    const result = await this.authService.verifyOtp(dto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const dto = new ResetPasswordRequestDto(req.body);
    const result = await this.authService.resetPassword(dto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const userId = (req as any).user.id;
    const result = await this.authService.logout(userId);
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
    }
    return new HttpResponseDto().success(res, result);
  }
}
