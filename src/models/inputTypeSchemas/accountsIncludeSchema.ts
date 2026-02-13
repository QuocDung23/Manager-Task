import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { usersArgsSchema } from "../outputTypeSchemas/usersArgsSchema"

export const accountsIncludeSchema: z.ZodType<Prisma.accountsInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => usersArgsSchema)]).optional(),
}).strict();

export default accountsIncludeSchema;
