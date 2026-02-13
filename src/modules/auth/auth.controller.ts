import { Exception } from "@tsed/exceptions";
import { AuthService } from "./auth.service";
import { RegisterDtos } from "./dtos/requests/register.req";
import { HttpResponseDto } from "@/common";
import { AccountResDto } from "./dtos/responses/account.res";
import { NextFunction, Request, Response } from 'express';


export class AuthController {
    constructor(
       private readonly authService = new AuthService()
    ) {}

    async register(req: Request): Promise<Response> {
        const regiterDto = req.body as RegisterDtos
        const result = await this.authService.register(regiterDto)
        if(result instanceof Exception) {
            return new HttpResponseDto().exception(result)
        }
        return new HttpResponseDto().created<AccountResDto>(result)
    }
}