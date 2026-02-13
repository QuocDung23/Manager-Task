import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensCreateManyInputSchema } from '../inputTypeSchemas/tokensCreateManyInputSchema'

export const tokensCreateManyAndReturnArgsSchema: z.ZodType<Prisma.tokensCreateManyAndReturnArgs> = z.object({
  data: z.union([ tokensCreateManyInputSchema, tokensCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default tokensCreateManyAndReturnArgsSchema;
