import { ZodValidationSchema } from "@/common"
import z, { email } from "zod"

export class ForgotPasswordRequestDto {
    email!: string

    constructor(data: ForgotPasswordRequestDto) {
        this.email = data.email
    }
}

export const forgotPasswordRequestBody = z.object({
    email: z.string().email()
})

export const forgotPasswordRequestValidationSchema: ZodValidationSchema = {
    body: forgotPasswordRequestBody
}

export const forgotPasswordRequestSchema = {
    body: {
        description: 'Forgot Password',
        content: {
            'application/json': {
                schema: forgotPasswordRequestBody
            }
        }
    }
}
