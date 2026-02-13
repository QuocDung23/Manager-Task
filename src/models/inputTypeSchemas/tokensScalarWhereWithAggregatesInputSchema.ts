import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';

export const tokensScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.tokensScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => tokensScalarWhereWithAggregatesInputSchema), z.lazy(() => tokensScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => tokensScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => tokensScalarWhereWithAggregatesInputSchema), z.lazy(() => tokensScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  refreshToken: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export default tokensScalarWhereWithAggregatesInputSchema;
