import { accountsWithPartialRelations } from "@/models";
import { UserStatus } from "@prisma/client";
import z from "zod";

export class AccountResDto {
  id: string;
  userId: string;
  email: string;
  name: string;
  bio: string;
  avatar: string | null;
  verify: boolean;
  status: UserStatus;

  constructor(account: accountsWithPartialRelations) {
    this.id = account.id;
    this.userId = account.userId;
    this.email = account.user?.email || "";
    this.name = account.user?.name || "";
    this.bio = account.user?.bio || "";
    this.avatar = account.user?.avatar || "";
    this.verify = account.user?.verify || false;
    this.status = account.user?.status || UserStatus.ACTIVE;

    if (account.user) {
      this.name = account.user.name || "";
      this.avatar = account.user.avatar || "";
    }
  }
}

export const accountResDtoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url(),
  bio: z.string(),
  verify: z.boolean(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.LOCKED]),
});
