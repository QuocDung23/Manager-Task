import { ZodValidationSchema } from "@/common";
import z from "zod";

export class GetUserByEmailRequestDto {
    email?: string;
    name?: string
    status?: string;

    constructor(data: Partial<GetUserByEmailRequestDto>) {
      this.email = data.email;
      this.name = data.name;
      this.status = data.status;
    }
}

export const getUserByEmailRequestBody = z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    status: z.string().optional(),
})

export const getUserByEmailValidationSchema: ZodValidationSchema = {
    body: getUserByEmailRequestBody
}

export const getUserByEmailRequestSchema = {
    body: getUserByEmailRequestBody   
}