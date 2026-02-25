import { users } from "@/models";
import { UserStatus } from "@prisma/client";

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
		this.avatar = user.avatar ?? null;
		this.verify = user.verify;
		this.status = user.status;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
		this.deletedAt = user.deletedAt ?? null;
	}
}
