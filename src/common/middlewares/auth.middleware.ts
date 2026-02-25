import { UserRepository } from "@/modules/user/user.repository";
import { BaseAutoBindMiddleware } from "./baseAutoBindmiddleware";
import { ClientException, Exception } from "@tsed/exceptions";
import { MyInfomationResDto } from "@/modules/user/dtos";
import { OptionalException, UnauthorizedException } from "../exceptions";
import { ITokenPayload } from "../interface";
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';
import { jwtConfig } from "@/configs";
import { UserStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from 'express';


class AuthMiddleware extends BaseAutoBindMiddleware {
    constructor(
        private readonly userRepository = new UserRepository()
    ) { super() }

    async verifyAccessToken(req: Request, res: Response, next: NextFunction): Promise<void | Exception> {
        const cookies = req.headers.cookie;
        const cookieToken = cookies
            ?.split('; ')
            .find((row) => row.startsWith('accessToken='))
            ?.split('=')[1];
        const authHeader = req.headers.authorization;
        const headerToken = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : undefined;
        const accessToken = cookieToken ?? headerToken;

        if (!accessToken) {
            throw new UnauthorizedException();
        }

        try {
            const payload = verify(
                accessToken,
                jwtConfig.secretAccessToken as string
            ) as ITokenPayload;

            const userData = await this.userRepository.findUser({
                userId: payload.userId,
                status: UserStatus.ACTIVE
            });
            if (!userData) {
                throw new UnauthorizedException();
            }

            const user: MyInfomationResDto = new MyInfomationResDto(userData);
            (req as any).user = user;
        } catch (error: any) {
            if (error instanceof TokenExpiredError) {
                throw new OptionalException(StatusCodes.UNAUTHORIZED, error.message);
            }
            if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedException(error.message);
            }
        }
        next();
    }

    async verifyRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void | Exception> {
        const cookies = req.headers.cookie
        const accessToken = cookies
            ?.split('; ')
            .find((row) => row.startsWith('accessToken='))
            ?.split('=')[1]
        const refreshToken = cookies
			?.split('; ')
			.find((row) => row.startsWith('refreshToken='))
			?.split('=')[1];

        if(!refreshToken || !accessToken) {
            throw new UnauthorizedException()
        }

        try {
            const payloadRefreshToken: ITokenPayload = verify(
                refreshToken,
                jwtConfig.secretRefreshToken as string
            ) as ITokenPayload

            const payloadAccessToken: ITokenPayload = verify(
                accessToken,
                jwtConfig.secretAccessToken as string,
                {
                    ignoreExpiration: true
                }
            ) as ITokenPayload
            if(payloadAccessToken.exp > Date.now() / 1000) {
                throw new OptionalException(
                    StatusCodes.CONFLICT,
                    'accesstoken has not expired yet'
                )
            }

            const userData = await this.userRepository.findUser({
                userId: payloadRefreshToken.userId,
                status: UserStatus.ACTIVE
            })
            if (!userData) {
                throw new UnauthorizedException();
            }

            const user = new MyInfomationResDto(userData);
            (req as any).user = user;
        } catch(error) {
            if(error instanceof TokenExpiredError) {
                throw new OptionalException(
                    StatusCodes.UNAUTHORIZED,
                    error.message
                )
            }
            if(error instanceof JsonWebTokenError) {
                throw new UnauthorizedException(error.message)
            }

            if (error instanceof ClientException) {
				throw error;
			}
        }

        next()
    }
}

export default new AuthMiddleware()