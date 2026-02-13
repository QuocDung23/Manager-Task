import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { UsersRelationFilterSchema } from './UsersRelationFilterSchema';
import { usersWhereInputSchema } from './usersWhereInputSchema';

export const tokensWhereInputSchema: z.ZodType<Prisma.tokensWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => tokensWhereInputSchema), z.lazy(() => tokensWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => tokensWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => tokensWhereInputSchema), z.lazy(() => tokensWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  refreshToken: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UsersRelationFilterSchema), z.lazy(() => usersWhereInputSchema) ]).optional(),
});

export default tokensWhereInputSchema;
