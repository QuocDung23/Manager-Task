import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersCreateNestedOneWithoutAccountsInputSchema } from './usersCreateNestedOneWithoutAccountsInputSchema';

export const accountsCreateInputSchema: z.ZodType<Prisma.accountsCreateInput> = z.strictObject({
  id: z.string().optional(),
  password: z.string(),
  salt: z.string(),
  user: z.lazy(() => usersCreateNestedOneWithoutAccountsInputSchema),
});

export default accountsCreateInputSchema;
