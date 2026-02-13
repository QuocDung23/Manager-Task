import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { usersUpdateOneRequiredWithoutTokensNestedInputSchema } from './usersUpdateOneRequiredWithoutTokensNestedInputSchema';

export const tokensUpdateInputSchema: z.ZodType<Prisma.tokensUpdateInput> = z.strictObject({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refreshToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => usersUpdateOneRequiredWithoutTokensNestedInputSchema).optional(),
});

export default tokensUpdateInputSchema;
