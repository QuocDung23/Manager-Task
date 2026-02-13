import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsCreateManyInputSchema } from '../inputTypeSchemas/accountsCreateManyInputSchema'

export const accountsCreateManyArgsSchema: z.ZodType<Prisma.accountsCreateManyArgs> = z.object({
  data: z.union([ accountsCreateManyInputSchema, accountsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default accountsCreateManyArgsSchema;
