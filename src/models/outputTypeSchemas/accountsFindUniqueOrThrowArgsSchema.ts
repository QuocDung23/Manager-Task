import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsIncludeSchema } from '../inputTypeSchemas/accountsIncludeSchema'
import { accountsWhereUniqueInputSchema } from '../inputTypeSchemas/accountsWhereUniqueInputSchema'
import { usersArgsSchema } from "../outputTypeSchemas/usersArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const accountsSelectSchema: z.ZodType<Prisma.accountsSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  password: z.boolean().optional(),
  salt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => usersArgsSchema)]).optional(),
}).strict()

export const accountsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.accountsFindUniqueOrThrowArgs> = z.object({
  select: accountsSelectSchema.optional(),
  include: z.lazy(() => accountsIncludeSchema).optional(),
  where: accountsWhereUniqueInputSchema, 
}).strict();

export default accountsFindUniqueOrThrowArgsSchema;
