import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';
import { accountsCreateNestedOneWithoutUserInputSchema } from './accountsCreateNestedOneWithoutUserInputSchema';
import { tokensCreateNestedManyWithoutUserInputSchema } from './tokensCreateNestedManyWithoutUserInputSchema';

export const usersCreateInputSchema: z.ZodType<Prisma.usersCreateInput> = z.strictObject({
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
  accounts: z.lazy(() => accountsCreateNestedOneWithoutUserInputSchema).optional(),
  tokens: z.lazy(() => tokensCreateNestedManyWithoutUserInputSchema).optional(),
});

export default usersCreateInputSchema;
