import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { usersCreateManyInputSchema } from '../inputTypeSchemas/usersCreateManyInputSchema'

export const usersCreateManyAndReturnArgsSchema: z.ZodType<Prisma.usersCreateManyAndReturnArgs> = z.object({
  data: z.union([ usersCreateManyInputSchema, usersCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default usersCreateManyAndReturnArgsSchema;
