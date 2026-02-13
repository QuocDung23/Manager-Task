import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { accountsCreateWithoutUserInputSchema } from './accountsCreateWithoutUserInputSchema';
import { accountsUncheckedCreateWithoutUserInputSchema } from './accountsUncheckedCreateWithoutUserInputSchema';
import { accountsCreateOrConnectWithoutUserInputSchema } from './accountsCreateOrConnectWithoutUserInputSchema';
import { accountsWhereUniqueInputSchema } from './accountsWhereUniqueInputSchema';

export const accountsUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.accountsUncheckedCreateNestedOneWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => accountsCreateWithoutUserInputSchema), z.lazy(() => accountsUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => accountsCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => accountsWhereUniqueInputSchema).optional(),
});

export default accountsUncheckedCreateNestedOneWithoutUserInputSchema;
