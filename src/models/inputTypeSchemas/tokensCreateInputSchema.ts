import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersCreateNestedOneWithoutTokensInputSchema } from './usersCreateNestedOneWithoutTokensInputSchema';

export const tokensCreateInputSchema: z.ZodType<Prisma.tokensCreateInput> = z.strictObject({
  id: z.string().optional(),
  refreshToken: z.string(),
  user: z.lazy(() => usersCreateNestedOneWithoutTokensInputSchema),
});

export default tokensCreateInputSchema;
