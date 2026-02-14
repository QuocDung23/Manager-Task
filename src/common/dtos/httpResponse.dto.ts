import { HTTPException } from '@tsed/exceptions';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpResponseBodySuccessDto } from './httpResponseBodySuccess.dto';

export class HttpResponseDto {
    success<T>(res: Response, data: HttpResponseBodySuccessDto<T>): Response {
        return res.status(StatusCodes.OK).json(data);
    }

    created<T>(res: Response, data: HttpResponseBodySuccessDto<T>): Response {
        return res.status(StatusCodes.CREATED).json(data);
    }

    exception(res: Response, exceptions: HTTPException): Response {
        return res.status(exceptions.status).json({
            success: false,
            message: exceptions.message,
        });
    }
}