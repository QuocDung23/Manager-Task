import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';
import { accountsUncheckedCreateNestedOneWithoutUserInputSchema } from './accountsUncheckedCreateNestedOneWithoutUserInputSchema';

export const usersUncheckedCreateWithoutTokensInputSchema: z.ZodType<Prisma.usersUncheckedCreateWithoutTokensInput> = z.strictObject({
  id: z.string().optional(),
  name: z.string(),
  email: z.string(),
  bio: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  verify: z.boolean().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  accounts: z.lazy(() => accountsUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
});

export default usersUncheckedCreateWithoutTokensInputSchema;
