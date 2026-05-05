import z from "zod";

export const updateAvatarResponseSchema = z.object({
  avatar: z.string().url(),
});
