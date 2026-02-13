import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const accountsUncheckedCreateInputSchema: z.ZodType<Prisma.accountsUncheckedCreateInput> = z.strictObject({
  id: z.string().optional(),
  userId: z.string(),
  password: z.string(),
  salt: z.string(),
});

export default accountsUncheckedCreateInputSchema;
