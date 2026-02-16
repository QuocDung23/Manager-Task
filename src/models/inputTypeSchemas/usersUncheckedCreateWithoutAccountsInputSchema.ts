import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';
import { tokensUncheckedCreateNestedManyWithoutUserInputSchema } from './tokensUncheckedCreateNestedManyWithoutUserInputSchema';
import { otpsUncheckedCreateNestedOneWithoutUserInputSchema } from './otpsUncheckedCreateNestedOneWithoutUserInputSchema';

export const usersUncheckedCreateWithoutAccountsInputSchema: z.ZodType<Prisma.usersUncheckedCreateWithoutAccountsInput> = z.strictObject({
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
  tokens: z.lazy(() => tokensUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  otp: z.lazy(() => otpsUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
});

export default usersUncheckedCreateWithoutAccountsInputSchema;
