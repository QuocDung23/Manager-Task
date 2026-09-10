import { getCloudinaryDisplayImageUrl } from "@/common";
import { UserStatus, users } from "@prisma/client";
import z from "zod";



export class MyInfomationResDto {
  id: string;
	email: string;
	name: string;
	bio: string | null;
	address: string | null;
	avatar: string | null;
	verify: boolean;
	status: UserStatus;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	constructor(user: users) {
		this.id = user.id;
		this.email = user.email;
		this.name = user.name;
		this.bio = user.bio ?? null;
		this.address = user.address ?? null;
		this.avatar = getCloudinaryDisplayImageUrl(user.avatar);
		this.verify = user.verify;
		this.status = user.status;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
		this.deletedAt = user.deletedAt ?? null;
	}
}

export const myInfomationResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  bio: z.string().nullable(),
  address: z.string().nullable(),
  avatar: z.string().nullable(),
  verify: z.boolean(),
  status: z.enum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
