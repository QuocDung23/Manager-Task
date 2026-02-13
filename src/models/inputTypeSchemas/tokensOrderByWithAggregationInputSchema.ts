import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { tokensCountOrderByAggregateInputSchema } from './tokensCountOrderByAggregateInputSchema';
import { tokensMaxOrderByAggregateInputSchema } from './tokensMaxOrderByAggregateInputSchema';
import { tokensMinOrderByAggregateInputSchema } from './tokensMinOrderByAggregateInputSchema';

export const tokensOrderByWithAggregationInputSchema: z.ZodType<Prisma.tokensOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  refreshToken: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => tokensCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => tokensMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => tokensMinOrderByAggregateInputSchema).optional(),
});

export default tokensOrderByWithAggregationInputSchema;
