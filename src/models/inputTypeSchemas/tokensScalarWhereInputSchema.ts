import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';

export const tokensScalarWhereInputSchema: z.ZodType<Prisma.tokensScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => tokensScalarWhereInputSchema), z.lazy(() => tokensScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => tokensScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => tokensScalarWhereInputSchema), z.lazy(() => tokensScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  refreshToken: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
});

export default tokensScalarWhereInputSchema;
