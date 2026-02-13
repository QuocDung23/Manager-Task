import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { accountsCountOrderByAggregateInputSchema } from './accountsCountOrderByAggregateInputSchema';
import { accountsMaxOrderByAggregateInputSchema } from './accountsMaxOrderByAggregateInputSchema';
import { accountsMinOrderByAggregateInputSchema } from './accountsMinOrderByAggregateInputSchema';

export const accountsOrderByWithAggregationInputSchema: z.ZodType<Prisma.accountsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  salt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => accountsCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => accountsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => accountsMinOrderByAggregateInputSchema).optional(),
});

export default accountsOrderByWithAggregationInputSchema;
