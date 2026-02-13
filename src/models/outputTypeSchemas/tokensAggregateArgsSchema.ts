import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensWhereInputSchema } from '../inputTypeSchemas/tokensWhereInputSchema'
import { tokensOrderByWithRelationInputSchema } from '../inputTypeSchemas/tokensOrderByWithRelationInputSchema'
import { tokensWhereUniqueInputSchema } from '../inputTypeSchemas/tokensWhereUniqueInputSchema'

export const tokensAggregateArgsSchema: z.ZodType<Prisma.tokensAggregateArgs> = z.object({
  where: tokensWhereInputSchema.optional(), 
  orderBy: z.union([ tokensOrderByWithRelationInputSchema.array(), tokensOrderByWithRelationInputSchema ]).optional(),
  cursor: tokensWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default tokensAggregateArgsSchema;
