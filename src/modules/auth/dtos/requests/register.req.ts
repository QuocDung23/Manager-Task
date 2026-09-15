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
        email: z.string().email({ message: "Invalid email format" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
        name: z.string().min(1, { message: "Name is required" })
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
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