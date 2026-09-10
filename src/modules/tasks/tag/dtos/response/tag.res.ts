import { TagStatus } from "@prisma/client";
import z from "zod";

export class TagResponseDto {
  id: string;
  boardId: string;
  name: string;
  color: string;
  status: TagStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: TagResponseDto) {
    this.id = data.id;
    this.boardId = data.boardId;
    this.name = data.name;
    this.color = data.color;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}

export const tagResponseSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  status: z.enum(TagStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
