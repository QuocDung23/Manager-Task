import { paginationSchema, ZodValidationSchema } from "@/common";
import { UserStatus } from "@prisma/client";
import z from "zod";

export class GetUsersRequestDto {
  name?: string;
  status?: UserStatus;

  constructor(data?: Partial<GetUsersRequestDto>) {
    this.name = data?.name;
    this.status = data?.status;
  }
}

export const getUsersRequestQuery = z.object({
  name: z.string().optional(),
  status: z.enum(UserStatus).optional(),
});

export const getUsersRequestValidationSchema: ZodValidationSchema = {
  query: getUsersRequestQuery,
};
export const getUsersRequestSchema = {
  query: getUsersRequestQuery,
};
