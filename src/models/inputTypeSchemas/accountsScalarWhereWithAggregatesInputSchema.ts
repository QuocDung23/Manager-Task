import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';

export const accountsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.accountsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => accountsScalarWhereWithAggregatesInputSchema), z.lazy(() => accountsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => accountsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => accountsScalarWhereWithAggregatesInputSchema), z.lazy(() => accountsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  salt: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export default accountsScalarWhereWithAggregatesInputSchema;
