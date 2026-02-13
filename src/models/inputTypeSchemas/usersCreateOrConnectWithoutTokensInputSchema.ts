import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersWhereUniqueInputSchema } from './usersWhereUniqueInputSchema';
import { usersCreateWithoutTokensInputSchema } from './usersCreateWithoutTokensInputSchema';
import { usersUncheckedCreateWithoutTokensInputSchema } from './usersUncheckedCreateWithoutTokensInputSchema';

export const usersCreateOrConnectWithoutTokensInputSchema: z.ZodType<Prisma.usersCreateOrConnectWithoutTokensInput> = z.strictObject({
  where: z.lazy(() => usersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => usersCreateWithoutTokensInputSchema), z.lazy(() => usersUncheckedCreateWithoutTokensInputSchema) ]),
});

export default usersCreateOrConnectWithoutTokensInputSchema;
