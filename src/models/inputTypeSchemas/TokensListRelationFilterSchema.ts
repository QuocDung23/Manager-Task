import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensWhereInputSchema } from './tokensWhereInputSchema';

export const TokensListRelationFilterSchema: z.ZodType<Prisma.TokensListRelationFilter> = z.strictObject({
  every: z.lazy(() => tokensWhereInputSchema).optional(),
  some: z.lazy(() => tokensWhereInputSchema).optional(),
  none: z.lazy(() => tokensWhereInputSchema).optional(),
});

export default TokensListRelationFilterSchema;
