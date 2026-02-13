import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensWhereUniqueInputSchema } from './tokensWhereUniqueInputSchema';
import { tokensCreateWithoutUserInputSchema } from './tokensCreateWithoutUserInputSchema';
import { tokensUncheckedCreateWithoutUserInputSchema } from './tokensUncheckedCreateWithoutUserInputSchema';

export const tokensCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.tokensCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => tokensWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => tokensCreateWithoutUserInputSchema), z.lazy(() => tokensUncheckedCreateWithoutUserInputSchema) ]),
});

export default tokensCreateOrConnectWithoutUserInputSchema;
