import { ZodValidationSchema } from "@/common";
import z from "zod";

export class ResetPasswordRequestDto {
  email!: string;
  otp!: string;
  newPassword!: string;
  confirmPassword!: string;

  constructor(data: ResetPasswordRequestDto) {
    this.email = data.email;
    this.otp = data.otp;
    this.newPassword = data.newPassword;
    this.confirmPassword = data.confirmPassword;
  }
}

export const resetPasswordRequestBody = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6).max(20),
    confirmPassword: z.string().min(6).max(20),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

export const resetPasswordRequestValidationSchema: ZodValidationSchema = {
  body: resetPasswordRequestBody,
};

export const resetPasswordRequestSchema = {
  body: {
    description: "Reset password using OTP",
    content: {
      "application/json": {
        schema: resetPasswordRequestBody,
      },
    },
  },
};
