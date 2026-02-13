import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { usersUpdateOneRequiredWithoutAccountsNestedInputSchema } from './usersUpdateOneRequiredWithoutAccountsNestedInputSchema';

export const accountsUpdateInputSchema: z.ZodType<Prisma.accountsUpdateInput> = z.strictObject({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  salt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => usersUpdateOneRequiredWithoutAccountsNestedInputSchema).optional(),
});

export default accountsUpdateInputSchema;
