import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersWhereInputSchema } from './usersWhereInputSchema';
import { usersUpdateWithoutAccountsInputSchema } from './usersUpdateWithoutAccountsInputSchema';
import { usersUncheckedUpdateWithoutAccountsInputSchema } from './usersUncheckedUpdateWithoutAccountsInputSchema';

export const usersUpdateToOneWithWhereWithoutAccountsInputSchema: z.ZodType<Prisma.usersUpdateToOneWithWhereWithoutAccountsInput> = z.strictObject({
  where: z.lazy(() => usersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => usersUpdateWithoutAccountsInputSchema), z.lazy(() => usersUncheckedUpdateWithoutAccountsInputSchema) ]),
});

export default usersUpdateToOneWithWhereWithoutAccountsInputSchema;
