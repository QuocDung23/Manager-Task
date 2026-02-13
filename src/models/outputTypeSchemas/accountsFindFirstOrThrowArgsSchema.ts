import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsIncludeSchema } from '../inputTypeSchemas/accountsIncludeSchema'
import { accountsWhereInputSchema } from '../inputTypeSchemas/accountsWhereInputSchema'
import { accountsOrderByWithRelationInputSchema } from '../inputTypeSchemas/accountsOrderByWithRelationInputSchema'
import { accountsWhereUniqueInputSchema } from '../inputTypeSchemas/accountsWhereUniqueInputSchema'
import { AccountsScalarFieldEnumSchema } from '../inputTypeSchemas/AccountsScalarFieldEnumSchema'
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

export const accountsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.accountsFindFirstOrThrowArgs> = z.object({
  select: accountsSelectSchema.optional(),
  include: z.lazy(() => accountsIncludeSchema).optional(),
  where: accountsWhereInputSchema.optional(), 
  orderBy: z.union([ accountsOrderByWithRelationInputSchema.array(), accountsOrderByWithRelationInputSchema ]).optional(),
  cursor: accountsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountsScalarFieldEnumSchema, AccountsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default accountsFindFirstOrThrowArgsSchema;
