import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { accountsWhereInputSchema } from './accountsWhereInputSchema';

export const AccountsNullableRelationFilterSchema: z.ZodType<Prisma.AccountsNullableRelationFilter> = z.strictObject({
  is: z.lazy(() => accountsWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => accountsWhereInputSchema).optional().nullable(),
});

export default AccountsNullableRelationFilterSchema;
