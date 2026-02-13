import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { usersOrderByWithRelationInputSchema } from './usersOrderByWithRelationInputSchema';

export const accountsOrderByWithRelationInputSchema: z.ZodType<Prisma.accountsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  salt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => usersOrderByWithRelationInputSchema).optional(),
});

export default accountsOrderByWithRelationInputSchema;
