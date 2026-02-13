import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsIncludeSchema } from '../inputTypeSchemas/accountsIncludeSchema'
import { accountsWhereUniqueInputSchema } from '../inputTypeSchemas/accountsWhereUniqueInputSchema'
import { accountsCreateInputSchema } from '../inputTypeSchemas/accountsCreateInputSchema'
import { accountsUncheckedCreateInputSchema } from '../inputTypeSchemas/accountsUncheckedCreateInputSchema'
import { accountsUpdateInputSchema } from '../inputTypeSchemas/accountsUpdateInputSchema'
import { accountsUncheckedUpdateInputSchema } from '../inputTypeSchemas/accountsUncheckedUpdateInputSchema'
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

export const accountsUpsertArgsSchema: z.ZodType<Prisma.accountsUpsertArgs> = z.object({
  select: accountsSelectSchema.optional(),
  include: z.lazy(() => accountsIncludeSchema).optional(),
  where: accountsWhereUniqueInputSchema, 
  create: z.union([ accountsCreateInputSchema, accountsUncheckedCreateInputSchema ]),
  update: z.union([ accountsUpdateInputSchema, accountsUncheckedUpdateInputSchema ]),
}).strict();

export default accountsUpsertArgsSchema;
