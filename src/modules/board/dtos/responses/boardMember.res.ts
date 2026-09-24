import { BoardMemberStatus } from "@prisma/client";
import z from "zod";

export class BoardMemberResponseDto {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  boardMemberId: string;
  roleId: string;
  role: string;
  status: BoardMemberStatus;

  constructor(data: {
    id: string;
    userId: string;
    boardId: string;
    roleId: string;
    status: BoardMemberStatus;
    user: { id: string; name: string; email: string; avatar: string | null };
    role?: { name: string } | null;
  }) {
    this.id = data.user.id;
    this.name = data.user.name;
    this.email = data.user.email;
    this.avatar = data.user.avatar;
    this.boardMemberId = data.id;
    this.roleId = data.roleId;
    this.role = data.role?.name ?? "";
    this.status = data.status;
  }
}
export const boardMemberResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable(),
  boardMemberId: z.string().uuid(),
  roleId: z.string().uuid(),
  role: z.string(),
  status: z.enum(BoardMemberStatus),
});
