import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { accountsWhereInputSchema } from './accountsWhereInputSchema';
import { accountsUpdateWithoutUserInputSchema } from './accountsUpdateWithoutUserInputSchema';
import { accountsUncheckedUpdateWithoutUserInputSchema } from './accountsUncheckedUpdateWithoutUserInputSchema';

export const accountsUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.accountsUpdateToOneWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => accountsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => accountsUpdateWithoutUserInputSchema), z.lazy(() => accountsUncheckedUpdateWithoutUserInputSchema) ]),
});

export default accountsUpdateToOneWithWhereWithoutUserInputSchema;
