import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensIncludeSchema } from '../inputTypeSchemas/tokensIncludeSchema'
import { tokensCreateInputSchema } from '../inputTypeSchemas/tokensCreateInputSchema'
import { tokensUncheckedCreateInputSchema } from '../inputTypeSchemas/tokensUncheckedCreateInputSchema'
import { usersArgsSchema } from "../outputTypeSchemas/usersArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const tokensSelectSchema: z.ZodType<Prisma.tokensSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  refreshToken: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => usersArgsSchema)]).optional(),
}).strict()

export const tokensCreateArgsSchema: z.ZodType<Prisma.tokensCreateArgs> = z.object({
  select: tokensSelectSchema.optional(),
  include: z.lazy(() => tokensIncludeSchema).optional(),
  data: z.union([ tokensCreateInputSchema, tokensUncheckedCreateInputSchema ]),
}).strict();

export default tokensCreateArgsSchema;
