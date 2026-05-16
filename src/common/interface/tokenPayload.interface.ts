import { UserStatus } from "@prisma/client";

export interface ITokenPayload {
  userId: string;
  email?: string;
  verify?: boolean;
  status?: UserStatus;
  iat: number;
  exp: number;
}