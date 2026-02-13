import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const accountsUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.accountsUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.string().optional(),
  password: z.string(),
  salt: z.string(),
});

export default accountsUncheckedCreateWithoutUserInputSchema;
