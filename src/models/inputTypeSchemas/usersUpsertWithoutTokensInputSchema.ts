import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersUpdateWithoutTokensInputSchema } from './usersUpdateWithoutTokensInputSchema';
import { usersUncheckedUpdateWithoutTokensInputSchema } from './usersUncheckedUpdateWithoutTokensInputSchema';
import { usersCreateWithoutTokensInputSchema } from './usersCreateWithoutTokensInputSchema';
import { usersUncheckedCreateWithoutTokensInputSchema } from './usersUncheckedCreateWithoutTokensInputSchema';
import { usersWhereInputSchema } from './usersWhereInputSchema';

export const usersUpsertWithoutTokensInputSchema: z.ZodType<Prisma.usersUpsertWithoutTokensInput> = z.strictObject({
  update: z.union([ z.lazy(() => usersUpdateWithoutTokensInputSchema), z.lazy(() => usersUncheckedUpdateWithoutTokensInputSchema) ]),
  create: z.union([ z.lazy(() => usersCreateWithoutTokensInputSchema), z.lazy(() => usersUncheckedCreateWithoutTokensInputSchema) ]),
  where: z.lazy(() => usersWhereInputSchema).optional(),
});

export default usersUpsertWithoutTokensInputSchema;
