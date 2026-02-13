import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersCreateWithoutAccountsInputSchema } from './usersCreateWithoutAccountsInputSchema';
import { usersUncheckedCreateWithoutAccountsInputSchema } from './usersUncheckedCreateWithoutAccountsInputSchema';
import { usersCreateOrConnectWithoutAccountsInputSchema } from './usersCreateOrConnectWithoutAccountsInputSchema';
import { usersUpsertWithoutAccountsInputSchema } from './usersUpsertWithoutAccountsInputSchema';
import { usersWhereUniqueInputSchema } from './usersWhereUniqueInputSchema';
import { usersUpdateToOneWithWhereWithoutAccountsInputSchema } from './usersUpdateToOneWithWhereWithoutAccountsInputSchema';
import { usersUpdateWithoutAccountsInputSchema } from './usersUpdateWithoutAccountsInputSchema';
import { usersUncheckedUpdateWithoutAccountsInputSchema } from './usersUncheckedUpdateWithoutAccountsInputSchema';

export const usersUpdateOneRequiredWithoutAccountsNestedInputSchema: z.ZodType<Prisma.usersUpdateOneRequiredWithoutAccountsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => usersCreateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => usersCreateOrConnectWithoutAccountsInputSchema).optional(),
  upsert: z.lazy(() => usersUpsertWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => usersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => usersUpdateToOneWithWhereWithoutAccountsInputSchema), z.lazy(() => usersUpdateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedUpdateWithoutAccountsInputSchema) ]).optional(),
});

export default usersUpdateOneRequiredWithoutAccountsNestedInputSchema;
