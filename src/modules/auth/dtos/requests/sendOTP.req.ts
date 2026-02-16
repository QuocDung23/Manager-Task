import { ZodValidationSchema } from "@/common"
import z from "zod"

export class SendOtpRequestDto {
    email: string

    constructor(data: SendOtpRequestDto) {
        this.email = data.email
    }
}

const sendOtpRequestBodySchema = z.object({
    email: z.email()
})

export const sendOtpRequestValidationSchema: ZodValidationSchema = {
    body: sendOtpRequestBodySchema
}

export const sendOtpRequestSchema = {
    body: {
        description: 'send OTP to email for verif',
        content: {
            'application/json': {
                schema: sendOtpRequestBodySchema
            }
        }
    }
}