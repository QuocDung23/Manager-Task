import z from "zod";

export const changPasswordResponseSchema = z.object({
    password: z.string()
})