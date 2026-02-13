import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { accountsWhereUniqueInputSchema } from './accountsWhereUniqueInputSchema';
import { accountsCreateWithoutUserInputSchema } from './accountsCreateWithoutUserInputSchema';
import { accountsUncheckedCreateWithoutUserInputSchema } from './accountsUncheckedCreateWithoutUserInputSchema';

export const accountsCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.accountsCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => accountsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => accountsCreateWithoutUserInputSchema), z.lazy(() => accountsUncheckedCreateWithoutUserInputSchema) ]),
});

export default accountsCreateOrConnectWithoutUserInputSchema;
