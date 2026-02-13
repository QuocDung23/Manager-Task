import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensWhereInputSchema } from './tokensWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { UsersRelationFilterSchema } from './UsersRelationFilterSchema';
import { usersWhereInputSchema } from './usersWhereInputSchema';

export const tokensWhereUniqueInputSchema: z.ZodType<Prisma.tokensWhereUniqueInput> = z.union([
  z.object({
    userId: z.string(),
    refreshToken: z.string(),
  }),
  z.object({
    userId: z.string(),
  }),
  z.object({
    refreshToken: z.string(),
  }),
])
.and(z.strictObject({
  userId: z.string().optional(),
  refreshToken: z.string().optional(),
  AND: z.union([ z.lazy(() => tokensWhereInputSchema), z.lazy(() => tokensWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => tokensWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => tokensWhereInputSchema), z.lazy(() => tokensWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UsersRelationFilterSchema), z.lazy(() => usersWhereInputSchema) ]).optional(),
}));

export default tokensWhereUniqueInputSchema;
