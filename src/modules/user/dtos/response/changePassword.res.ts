import z from "zod";

export class ChangePasswordResponseDto {
  message: string;

  constructor(message: string = "Password changed successfully") {
    this.message = message;
  }
}

export const changePasswordResponseSchema = z.object({
  message: z.string(),
});
