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
import { VerifyRequestDto } from "./dtos/requests/verifyOtp.req";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const registerDto = req.body as RegisterRequestDto; // (hoặc RegisterDtos)
      const result = await this.authService.register(registerDto);

      if (result instanceof Exception) {
        return new HttpResponseDto().exception(res, result);
      }

      return new HttpResponseDto().created<AccountResDto>(res, result);
    } catch (error: any) {
      console.error("System Error in Register:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    const loginDto = req.body as LoginRequestDto;
    const result = await this.authService.login(loginDto);
    if (result instanceof Exception) {
      return new HttpResponseDto().exception(res, result);
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
}
