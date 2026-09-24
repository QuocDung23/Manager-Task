import z from "zod";
import { BoardStatus } from "@prisma/client";

export class BoardResponseDto {
  id: string;
  name: string;
  description: string;
  projectId: string;
  userId: string;
  status: BoardStatus;

  constructor(data: BoardResponseDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.projectId = data.projectId;
    this.userId = data.userId;
    this.status = data.status;

  }
}

export const boardResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(BoardStatus),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
