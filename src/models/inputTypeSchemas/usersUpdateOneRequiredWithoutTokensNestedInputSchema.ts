import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { usersCreateWithoutTokensInputSchema } from './usersCreateWithoutTokensInputSchema';
import { usersUncheckedCreateWithoutTokensInputSchema } from './usersUncheckedCreateWithoutTokensInputSchema';
import { usersCreateOrConnectWithoutTokensInputSchema } from './usersCreateOrConnectWithoutTokensInputSchema';
import { usersUpsertWithoutTokensInputSchema } from './usersUpsertWithoutTokensInputSchema';
import { usersWhereUniqueInputSchema } from './usersWhereUniqueInputSchema';
import { usersUpdateToOneWithWhereWithoutTokensInputSchema } from './usersUpdateToOneWithWhereWithoutTokensInputSchema';
import { usersUpdateWithoutTokensInputSchema } from './usersUpdateWithoutTokensInputSchema';
import { usersUncheckedUpdateWithoutTokensInputSchema } from './usersUncheckedUpdateWithoutTokensInputSchema';

export const usersUpdateOneRequiredWithoutTokensNestedInputSchema: z.ZodType<Prisma.usersUpdateOneRequiredWithoutTokensNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => usersCreateWithoutTokensInputSchema), z.lazy(() => usersUncheckedCreateWithoutTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => usersCreateOrConnectWithoutTokensInputSchema).optional(),
  upsert: z.lazy(() => usersUpsertWithoutTokensInputSchema).optional(),
  connect: z.lazy(() => usersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => usersUpdateToOneWithWhereWithoutTokensInputSchema), z.lazy(() => usersUpdateWithoutTokensInputSchema), z.lazy(() => usersUncheckedUpdateWithoutTokensInputSchema) ]).optional(),
});

export default usersUpdateOneRequiredWithoutTokensNestedInputSchema;
