import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsUpdateManyMutationInputSchema } from '../inputTypeSchemas/accountsUpdateManyMutationInputSchema'
import { accountsUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/accountsUncheckedUpdateManyInputSchema'
import { accountsWhereInputSchema } from '../inputTypeSchemas/accountsWhereInputSchema'

export const accountsUpdateManyArgsSchema: z.ZodType<Prisma.accountsUpdateManyArgs> = z.object({
  data: z.union([ accountsUpdateManyMutationInputSchema, accountsUncheckedUpdateManyInputSchema ]),
  where: accountsWhereInputSchema.optional(), 
}).strict();

export default accountsUpdateManyArgsSchema;
