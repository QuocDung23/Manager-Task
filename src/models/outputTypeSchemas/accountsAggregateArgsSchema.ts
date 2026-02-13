import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsWhereInputSchema } from '../inputTypeSchemas/accountsWhereInputSchema'
import { accountsOrderByWithRelationInputSchema } from '../inputTypeSchemas/accountsOrderByWithRelationInputSchema'
import { accountsWhereUniqueInputSchema } from '../inputTypeSchemas/accountsWhereUniqueInputSchema'

export const accountsAggregateArgsSchema: z.ZodType<Prisma.accountsAggregateArgs> = z.object({
  where: accountsWhereInputSchema.optional(), 
  orderBy: z.union([ accountsOrderByWithRelationInputSchema.array(), accountsOrderByWithRelationInputSchema ]).optional(),
  cursor: accountsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default accountsAggregateArgsSchema;
