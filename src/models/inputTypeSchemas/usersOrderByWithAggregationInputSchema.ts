import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { usersCountOrderByAggregateInputSchema } from './usersCountOrderByAggregateInputSchema';
import { usersMaxOrderByAggregateInputSchema } from './usersMaxOrderByAggregateInputSchema';
import { usersMinOrderByAggregateInputSchema } from './usersMinOrderByAggregateInputSchema';

export const usersOrderByWithAggregationInputSchema: z.ZodType<Prisma.usersOrderByWithAggregationInput> = z.strictObject({
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
  _count: z.lazy(() => usersCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => usersMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => usersMinOrderByAggregateInputSchema).optional(),
});

export default usersOrderByWithAggregationInputSchema;
