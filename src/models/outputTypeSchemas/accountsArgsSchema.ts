import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsSelectSchema } from '../inputTypeSchemas/accountsSelectSchema';
import { accountsIncludeSchema } from '../inputTypeSchemas/accountsIncludeSchema';

export const accountsArgsSchema: z.ZodType<Prisma.accountsDefaultArgs> = z.object({
  select: z.lazy(() => accountsSelectSchema).optional(),
  include: z.lazy(() => accountsIncludeSchema).optional(),
}).strict();

export default accountsArgsSchema;
