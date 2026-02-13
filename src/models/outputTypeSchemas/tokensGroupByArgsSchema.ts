import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensWhereInputSchema } from '../inputTypeSchemas/tokensWhereInputSchema'
import { tokensOrderByWithAggregationInputSchema } from '../inputTypeSchemas/tokensOrderByWithAggregationInputSchema'
import { TokensScalarFieldEnumSchema } from '../inputTypeSchemas/TokensScalarFieldEnumSchema'
import { tokensScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/tokensScalarWhereWithAggregatesInputSchema'

export const tokensGroupByArgsSchema: z.ZodType<Prisma.tokensGroupByArgs> = z.object({
  where: tokensWhereInputSchema.optional(), 
  orderBy: z.union([ tokensOrderByWithAggregationInputSchema.array(), tokensOrderByWithAggregationInputSchema ]).optional(),
  by: TokensScalarFieldEnumSchema.array(), 
  having: tokensScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default tokensGroupByArgsSchema;
