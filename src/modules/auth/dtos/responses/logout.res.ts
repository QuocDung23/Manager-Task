import z from "zod";

export class LogoutResponseDto {
    message: string;

  constructor(message: string = "logout successfully") {
    this.message = message;
  }
}

export const logoutResponseSchema = z.object({
  message: z.string(),
});