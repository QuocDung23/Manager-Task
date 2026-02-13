import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensCreateManyInputSchema } from '../inputTypeSchemas/tokensCreateManyInputSchema'

export const tokensCreateManyArgsSchema: z.ZodType<Prisma.tokensCreateManyArgs> = z.object({
  data: z.union([ tokensCreateManyInputSchema, tokensCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default tokensCreateManyArgsSchema;
