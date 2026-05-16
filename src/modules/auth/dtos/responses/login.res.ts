import z from "zod";
import { UserStatus } from "@prisma/client";

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  email: string;
  verify: boolean;
  status: UserStatus;
}

export const loginResponseDtoSchema = z.object({
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
  email: z.string().email(),
  verify: z.boolean(),
  status: z.enum(UserStatus),
});
