import { Exception } from "@tsed/exceptions";
import { AuthService } from "./auth.service";
import { HttpResponseDto } from "@/common";
import { AccountResDto } from "./dtos/responses/account.res";
import { Request, Response } from 'express';
import { LoginRequestDto, RegisterRequestDto } from "./dtos/requests";


export class AuthController {
    constructor(
       private readonly authService = new AuthService()
    ) {}

    
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
                message: "Internal Server Error"
            });
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
		const loginDto = req.body as LoginRequestDto;
		const result = await this.authService.login(loginDto);
		if (result instanceof Exception) {
			return new HttpResponseDto().exception(res,result);
		}
		return new HttpResponseDto().success(res, result);
	}
}