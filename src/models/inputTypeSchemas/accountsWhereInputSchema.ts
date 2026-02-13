import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { UsersRelationFilterSchema } from './UsersRelationFilterSchema';
import { usersWhereInputSchema } from './usersWhereInputSchema';

export const accountsWhereInputSchema: z.ZodType<Prisma.accountsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => accountsWhereInputSchema), z.lazy(() => accountsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => accountsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => accountsWhereInputSchema), z.lazy(() => accountsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  salt: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  user: z.union([ z.lazy(() => UsersRelationFilterSchema), z.lazy(() => usersWhereInputSchema) ]).optional(),
});

export default accountsWhereInputSchema;
