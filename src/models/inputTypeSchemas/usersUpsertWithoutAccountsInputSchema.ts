import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersUpdateWithoutAccountsInputSchema } from './usersUpdateWithoutAccountsInputSchema';
import { usersUncheckedUpdateWithoutAccountsInputSchema } from './usersUncheckedUpdateWithoutAccountsInputSchema';
import { usersCreateWithoutAccountsInputSchema } from './usersCreateWithoutAccountsInputSchema';
import { usersUncheckedCreateWithoutAccountsInputSchema } from './usersUncheckedCreateWithoutAccountsInputSchema';
import { usersWhereInputSchema } from './usersWhereInputSchema';

export const usersUpsertWithoutAccountsInputSchema: z.ZodType<Prisma.usersUpsertWithoutAccountsInput> = z.strictObject({
  update: z.union([ z.lazy(() => usersUpdateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedUpdateWithoutAccountsInputSchema) ]),
  create: z.union([ z.lazy(() => usersCreateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedCreateWithoutAccountsInputSchema) ]),
  where: z.lazy(() => usersWhereInputSchema).optional(),
});

export default usersUpsertWithoutAccountsInputSchema;
