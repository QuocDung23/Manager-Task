import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { usersIncludeSchema } from '../inputTypeSchemas/usersIncludeSchema'
import { usersWhereInputSchema } from '../inputTypeSchemas/usersWhereInputSchema'
import { usersOrderByWithRelationInputSchema } from '../inputTypeSchemas/usersOrderByWithRelationInputSchema'
import { usersWhereUniqueInputSchema } from '../inputTypeSchemas/usersWhereUniqueInputSchema'
import { UsersScalarFieldEnumSchema } from '../inputTypeSchemas/UsersScalarFieldEnumSchema'
import { accountsArgsSchema } from "../outputTypeSchemas/accountsArgsSchema"
import { tokensFindManyArgsSchema } from "../outputTypeSchemas/tokensFindManyArgsSchema"
import { otpsArgsSchema } from "../outputTypeSchemas/otpsArgsSchema"
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
  otp: z.union([z.boolean(),z.lazy(() => otpsArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const usersFindFirstArgsSchema: z.ZodType<Prisma.usersFindFirstArgs> = z.object({
  select: usersSelectSchema.optional(),
  include: z.lazy(() => usersIncludeSchema).optional(),
  where: usersWhereInputSchema.optional(), 
  orderBy: z.union([ usersOrderByWithRelationInputSchema.array(), usersOrderByWithRelationInputSchema ]).optional(),
  cursor: usersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UsersScalarFieldEnumSchema, UsersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default usersFindFirstArgsSchema;
