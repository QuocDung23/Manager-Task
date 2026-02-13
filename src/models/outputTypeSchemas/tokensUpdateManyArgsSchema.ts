import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensUpdateManyMutationInputSchema } from '../inputTypeSchemas/tokensUpdateManyMutationInputSchema'
import { tokensUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/tokensUncheckedUpdateManyInputSchema'
import { tokensWhereInputSchema } from '../inputTypeSchemas/tokensWhereInputSchema'

export const tokensUpdateManyArgsSchema: z.ZodType<Prisma.tokensUpdateManyArgs> = z.object({
  data: z.union([ tokensUpdateManyMutationInputSchema, tokensUncheckedUpdateManyInputSchema ]),
  where: tokensWhereInputSchema.optional(), 
}).strict();

export default tokensUpdateManyArgsSchema;
