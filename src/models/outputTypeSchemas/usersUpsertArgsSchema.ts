import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { usersIncludeSchema } from '../inputTypeSchemas/usersIncludeSchema'
import { usersWhereUniqueInputSchema } from '../inputTypeSchemas/usersWhereUniqueInputSchema'
import { usersCreateInputSchema } from '../inputTypeSchemas/usersCreateInputSchema'
import { usersUncheckedCreateInputSchema } from '../inputTypeSchemas/usersUncheckedCreateInputSchema'
import { usersUpdateInputSchema } from '../inputTypeSchemas/usersUpdateInputSchema'
import { usersUncheckedUpdateInputSchema } from '../inputTypeSchemas/usersUncheckedUpdateInputSchema'
import { accountsArgsSchema } from "../outputTypeSchemas/accountsArgsSchema"
import { tokensFindManyArgsSchema } from "../outputTypeSchemas/tokensFindManyArgsSchema"
import { UsersCountOutputTypeArgsSchema } from "../outputTypeSchemas/UsersCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const usersSelectSchema: z.ZodType<Prisma.usersSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  bio: z.boolean().optional(),
  address: z.boolean().optional(),
  phone: z.boolean().optional(),
  avatar: z.boolean().optional(),
  verify: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  accounts: z.union([z.boolean(),z.lazy(() => accountsArgsSchema)]).optional(),
  tokens: z.union([z.boolean(),z.lazy(() => tokensFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const usersUpsertArgsSchema: z.ZodType<Prisma.usersUpsertArgs> = z.object({
  select: usersSelectSchema.optional(),
  include: z.lazy(() => usersIncludeSchema).optional(),
  where: usersWhereUniqueInputSchema, 
  create: z.union([ usersCreateInputSchema, usersUncheckedCreateInputSchema ]),
  update: z.union([ usersUpdateInputSchema, usersUncheckedUpdateInputSchema ]),
}).strict();

export default usersUpsertArgsSchema;
