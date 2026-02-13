import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersWhereUniqueInputSchema } from './usersWhereUniqueInputSchema';
import { usersCreateWithoutAccountsInputSchema } from './usersCreateWithoutAccountsInputSchema';
import { usersUncheckedCreateWithoutAccountsInputSchema } from './usersUncheckedCreateWithoutAccountsInputSchema';

export const usersCreateOrConnectWithoutAccountsInputSchema: z.ZodType<Prisma.usersCreateOrConnectWithoutAccountsInput> = z.strictObject({
  where: z.lazy(() => usersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => usersCreateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedCreateWithoutAccountsInputSchema) ]),
});

export default usersCreateOrConnectWithoutAccountsInputSchema;
