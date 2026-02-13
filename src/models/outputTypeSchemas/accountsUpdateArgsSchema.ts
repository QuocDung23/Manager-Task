import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsIncludeSchema } from '../inputTypeSchemas/accountsIncludeSchema'
import { accountsUpdateInputSchema } from '../inputTypeSchemas/accountsUpdateInputSchema'
import { accountsUncheckedUpdateInputSchema } from '../inputTypeSchemas/accountsUncheckedUpdateInputSchema'
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

export const accountsUpdateArgsSchema: z.ZodType<Prisma.accountsUpdateArgs> = z.object({
  select: accountsSelectSchema.optional(),
  include: z.lazy(() => accountsIncludeSchema).optional(),
  data: z.union([ accountsUpdateInputSchema, accountsUncheckedUpdateInputSchema ]),
  where: accountsWhereUniqueInputSchema, 
}).strict();

export default accountsUpdateArgsSchema;
