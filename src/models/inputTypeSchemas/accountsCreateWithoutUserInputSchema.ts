import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const accountsCreateWithoutUserInputSchema: z.ZodType<Prisma.accountsCreateWithoutUserInput> = z.strictObject({
  id: z.string().optional(),
  password: z.string(),
  salt: z.string(),
});

export default accountsCreateWithoutUserInputSchema;
