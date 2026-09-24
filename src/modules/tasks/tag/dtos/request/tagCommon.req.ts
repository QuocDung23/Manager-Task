import z from "zod";

export const tagColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: "color must be a valid hex color",
  });
