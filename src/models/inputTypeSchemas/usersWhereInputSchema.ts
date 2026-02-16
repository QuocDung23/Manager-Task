import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { EnumUserStatusFilterSchema } from './EnumUserStatusFilterSchema';
import { UserStatusSchema } from './UserStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { AccountsNullableRelationFilterSchema } from './AccountsNullableRelationFilterSchema';
import { accountsWhereInputSchema } from './accountsWhereInputSchema';
import { TokensListRelationFilterSchema } from './TokensListRelationFilterSchema';
import { OtpsNullableRelationFilterSchema } from './OtpsNullableRelationFilterSchema';
import { otpsWhereInputSchema } from './otpsWhereInputSchema';

export const usersWhereInputSchema: z.ZodType<Prisma.usersWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => usersWhereInputSchema), z.lazy(() => usersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => usersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => usersWhereInputSchema), z.lazy(() => usersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bio: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  address: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  phone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  avatar: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  verify: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  accounts: z.union([ z.lazy(() => AccountsNullableRelationFilterSchema), z.lazy(() => accountsWhereInputSchema) ]).optional().nullable(),
  tokens: z.lazy(() => TokensListRelationFilterSchema).optional(),
  otp: z.union([ z.lazy(() => OtpsNullableRelationFilterSchema), z.lazy(() => otpsWhereInputSchema) ]).optional().nullable(),
});

export default usersWhereInputSchema;
