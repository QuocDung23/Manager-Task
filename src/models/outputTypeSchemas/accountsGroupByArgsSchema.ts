import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsWhereInputSchema } from '../inputTypeSchemas/accountsWhereInputSchema'
import { accountsOrderByWithAggregationInputSchema } from '../inputTypeSchemas/accountsOrderByWithAggregationInputSchema'
import { AccountsScalarFieldEnumSchema } from '../inputTypeSchemas/AccountsScalarFieldEnumSchema'
import { accountsScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/accountsScalarWhereWithAggregatesInputSchema'

export const accountsGroupByArgsSchema: z.ZodType<Prisma.accountsGroupByArgs> = z.object({
  where: accountsWhereInputSchema.optional(), 
  orderBy: z.union([ accountsOrderByWithAggregationInputSchema.array(), accountsOrderByWithAggregationInputSchema ]).optional(),
  by: AccountsScalarFieldEnumSchema.array(), 
  having: accountsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default accountsGroupByArgsSchema;
