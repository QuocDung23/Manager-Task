import { ZodValidationSchema } from "@/common";
import z from "zod";

export class LoginRequestDto {
  email: string;
  password: string;
}

export const loginRequestValidationSchema: ZodValidationSchema = {
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
};

export const loginRequestSchema = {
  body: {
    description: "Login to account",
    content: {
      "application/json": {
        schema: loginRequestValidationSchema.body!,
      },
    },
  },
};
