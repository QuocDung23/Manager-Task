import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { accountsUpdateWithoutUserInputSchema } from './accountsUpdateWithoutUserInputSchema';
import { accountsUncheckedUpdateWithoutUserInputSchema } from './accountsUncheckedUpdateWithoutUserInputSchema';
import { accountsCreateWithoutUserInputSchema } from './accountsCreateWithoutUserInputSchema';
import { accountsUncheckedCreateWithoutUserInputSchema } from './accountsUncheckedCreateWithoutUserInputSchema';
import { accountsWhereInputSchema } from './accountsWhereInputSchema';

export const accountsUpsertWithoutUserInputSchema: z.ZodType<Prisma.accountsUpsertWithoutUserInput> = z.strictObject({
  update: z.union([ z.lazy(() => accountsUpdateWithoutUserInputSchema), z.lazy(() => accountsUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => accountsCreateWithoutUserInputSchema), z.lazy(() => accountsUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => accountsWhereInputSchema).optional(),
});

export default accountsUpsertWithoutUserInputSchema;
