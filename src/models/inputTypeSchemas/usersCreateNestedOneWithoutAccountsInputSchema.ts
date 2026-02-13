import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersCreateWithoutAccountsInputSchema } from './usersCreateWithoutAccountsInputSchema';
import { usersUncheckedCreateWithoutAccountsInputSchema } from './usersUncheckedCreateWithoutAccountsInputSchema';
import { usersCreateOrConnectWithoutAccountsInputSchema } from './usersCreateOrConnectWithoutAccountsInputSchema';
import { usersWhereUniqueInputSchema } from './usersWhereUniqueInputSchema';

export const usersCreateNestedOneWithoutAccountsInputSchema: z.ZodType<Prisma.usersCreateNestedOneWithoutAccountsInput> = z.strictObject({
  create: z.union([ z.lazy(() => usersCreateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => usersCreateOrConnectWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => usersWhereUniqueInputSchema).optional(),
});

export default usersCreateNestedOneWithoutAccountsInputSchema;
