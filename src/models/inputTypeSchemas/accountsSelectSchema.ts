import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { usersArgsSchema } from "../outputTypeSchemas/usersArgsSchema"

export const accountsSelectSchema: z.ZodType<Prisma.accountsSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  password: z.boolean().optional(),
  salt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => usersArgsSchema)]).optional(),
}).strict()

export default accountsSelectSchema;
