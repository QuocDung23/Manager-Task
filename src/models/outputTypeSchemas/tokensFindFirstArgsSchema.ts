import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensIncludeSchema } from '../inputTypeSchemas/tokensIncludeSchema'
import { tokensWhereInputSchema } from '../inputTypeSchemas/tokensWhereInputSchema'
import { tokensOrderByWithRelationInputSchema } from '../inputTypeSchemas/tokensOrderByWithRelationInputSchema'
import { tokensWhereUniqueInputSchema } from '../inputTypeSchemas/tokensWhereUniqueInputSchema'
import { TokensScalarFieldEnumSchema } from '../inputTypeSchemas/TokensScalarFieldEnumSchema'
import { usersArgsSchema } from "../outputTypeSchemas/usersArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const tokensSelectSchema: z.ZodType<Prisma.tokensSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  refreshToken: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => usersArgsSchema)]).optional(),
}).strict()

export const tokensFindFirstArgsSchema: z.ZodType<Prisma.tokensFindFirstArgs> = z.object({
  select: tokensSelectSchema.optional(),
  include: z.lazy(() => tokensIncludeSchema).optional(),
  where: tokensWhereInputSchema.optional(), 
  orderBy: z.union([ tokensOrderByWithRelationInputSchema.array(), tokensOrderByWithRelationInputSchema ]).optional(),
  cursor: tokensWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TokensScalarFieldEnumSchema, TokensScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default tokensFindFirstArgsSchema;
