import { ZodValidationSchema } from "@/common";
import z from "zod";

export class ChangePasswordRequestDto {
  currentPassword!: string;
  newPassword!: string;
  confirmPassword!: string;

  constructor(data: ChangePasswordRequestDto) {
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
    this.confirmPassword = data.confirmPassword;
  }
}

export const changePasswordRequestBody = z
  .object({
    currentPassword: z.string().min(6).max(20),
    newPassword: z.string().min(6).max(20),
    confirmPassword: z.string().min(6).max(20),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password cannot be the same as the current password",
    path: ["newPassword"],
  });

export const changePasswordRequestValidationSchema: ZodValidationSchema = {
  body: changePasswordRequestBody,
};

export const changePasswordRequestSchema = {
  body: {
    content: {
      "application/json": {
        schema: changePasswordRequestBody,
      },
    },
  },
};
