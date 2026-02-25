import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { accountsOrderByWithRelationInputSchema } from './accountsOrderByWithRelationInputSchema';
import { tokensOrderByRelationAggregateInputSchema } from './tokensOrderByRelationAggregateInputSchema';
import { otpsOrderByWithRelationInputSchema } from './otpsOrderByWithRelationInputSchema';

export const usersOrderByWithRelationInputSchema: z.ZodType<Prisma.usersOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  bio: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  address: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  phone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  avatar: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  verify: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  accounts: z.lazy(() => accountsOrderByWithRelationInputSchema).optional(),
  tokens: z.lazy(() => tokensOrderByRelationAggregateInputSchema).optional(),
  otp: z.lazy(() => otpsOrderByWithRelationInputSchema).optional(),
});

export default usersOrderByWithRelationInputSchema;
