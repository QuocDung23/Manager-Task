import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensIncludeSchema } from '../inputTypeSchemas/tokensIncludeSchema'
import { tokensWhereUniqueInputSchema } from '../inputTypeSchemas/tokensWhereUniqueInputSchema'
import { usersArgsSchema } from "../outputTypeSchemas/usersArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const tokensSelectSchema: z.ZodType<Prisma.tokensSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  refreshToken: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => usersArgsSchema)]).optional(),
}).strict()

export const tokensDeleteArgsSchema: z.ZodType<Prisma.tokensDeleteArgs> = z.object({
  select: tokensSelectSchema.optional(),
  include: z.lazy(() => tokensIncludeSchema).optional(),
  where: tokensWhereUniqueInputSchema, 
}).strict();

export default tokensDeleteArgsSchema;
