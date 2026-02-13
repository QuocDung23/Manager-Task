import { ZodValidationSchema } from '@/common';
import z, { email } from "zod"

export class RegisterDtos {
    email: string
    password: string
    confirmPassword: string
    name: string
}

export const registerRequestValidationSchema: ZodValidationSchema = {
    body: z.object({
        email: z.email(),
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