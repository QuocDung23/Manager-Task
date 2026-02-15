import { ZodValidationSchema } from '@/common';
import z from "zod"

export class RegisterRequestDto {
    email: string
    password: string
    confirmPassword: string
    name: string
}

export const registerRequestValidationSchema: ZodValidationSchema = {
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
        name: z.string()
    })
}

export const registerRequestSchema = {
    body: {
        description: 'create a new account',
        content: {
            'application/json': {
                schema: registerRequestValidationSchema.body!
            }
        }
    }
}