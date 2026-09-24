import { ZodValidationSchema } from "@/common";
import z from "zod";

export class UpdateMyProfileRequestDto {
  name?: string;
  bio?: string | null;
  address?: string | null;
  phone?: string | null;

  constructor(data: UpdateMyProfileRequestDto) {
    this.name = data?.name;
    this.bio = data?.bio;
    this.address = data?.address;
    this.phone = data?.phone;
  }
}

export const updateMyProfileRequestBody = z.object({
  name: z.string().min(1).max(255).optional(),
  bio: z.string().max(2000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
});

export const updateMyProfileRequestValidationSchema: ZodValidationSchema = {
  body: updateMyProfileRequestBody,
};

export const updateMyProfileRequestSchema = {
  body: {
    content: {
      "application/json": {
        schema: updateMyProfileRequestBody,
      },
    },
  },
};

export class UpdateUserByUserIdRequestDto {
  userId: string;
  name?: string;
  bio?: string | null;
  address?: string | null;
  phone?: string | null;

  constructor(userId: string, data: Partial<UpdateUserByUserIdRequestDto>) {
    this.userId = userId;
    this.name = data?.name;
    this.bio = data?.bio;
    this.address = data?.address;
    this.phone = data?.phone;
  }
}

export const updateUserByUserIdRequestParams = z
  .object({
    userId: z.uuid(),
  })
  .strict();

export const updateUserByUserIdRequestBody = z.object({
  name: z.string().min(1).max(255).optional(),
  bio: z.string().max(2000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
});

export const updateUserByUserIdValidationSchema: ZodValidationSchema = {
  params: updateUserByUserIdRequestParams,
  body: updateUserByUserIdRequestBody,
};

export const updateUserByUserIdRequestSchema = {
  params: updateUserByUserIdRequestParams,
  body: {
    content: {
      "application/json": {
        schema: updateUserByUserIdRequestBody,
      },
    },
  },
};
