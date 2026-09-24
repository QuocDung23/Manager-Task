import z from "zod";

export class VerifyOtpResponseDto {
  email: string;
  isValid: boolean;

  constructor(email: string, isValid: boolean = true) {
    this.email = email;
    this.isValid = isValid;
  }
}

export const verifyOtpResponseSchema = z.object({
  email: z.string().email(),
  isValid: z.boolean(),
});

export class ResetPasswordResponseDto {
  email: string;
  isReset: boolean;

  constructor(email: string, isReset: boolean = true) {
    this.email = email;
    this.isReset = isReset;
  }
}

export const resetPasswordResponseSchema = z.object({
  email: z.string().email(),
  isReset: z.boolean(),
});
