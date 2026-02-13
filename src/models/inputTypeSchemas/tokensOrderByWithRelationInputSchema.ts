import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { usersOrderByWithRelationInputSchema } from './usersOrderByWithRelationInputSchema';

export const tokensOrderByWithRelationInputSchema: z.ZodType<Prisma.tokensOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  refreshToken: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => usersOrderByWithRelationInputSchema).optional(),
});

export default tokensOrderByWithRelationInputSchema;
