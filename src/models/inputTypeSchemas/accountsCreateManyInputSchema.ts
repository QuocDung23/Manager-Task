import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const accountsCreateManyInputSchema: z.ZodType<Prisma.accountsCreateManyInput> = z.strictObject({
  id: z.string().optional(),
  userId: z.string(),
  password: z.string(),
  salt: z.string(),
});

export default accountsCreateManyInputSchema;
