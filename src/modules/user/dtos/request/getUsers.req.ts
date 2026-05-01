import { paginationSchema, ZodValidationSchema } from "@/common";
import { UserStatus } from "@prisma/client";
import z from "zod";

export class GetUsersRequestDto {
  name?: string;
  email?: string;
  status?: UserStatus;

  constructor(data?: Partial<GetUsersRequestDto>) {
    this.name = data?.name;
    this.email = data?.email;
    this.status = data?.status;
  }
}

export const getUsersRequestQuery = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(UserStatus).optional(),
});

export const getUsersRequestValidationSchema: ZodValidationSchema = {
  query: getUsersRequestQuery,
};
export const getUsersRequestSchema = {
  query: getUsersRequestQuery,
};
