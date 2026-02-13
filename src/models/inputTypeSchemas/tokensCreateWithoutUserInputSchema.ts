import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const tokensCreateWithoutUserInputSchema: z.ZodType<Prisma.tokensCreateWithoutUserInput> = z.strictObject({
  id: z.string().optional(),
  refreshToken: z.string(),
});

export default tokensCreateWithoutUserInputSchema;
