import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensWhereUniqueInputSchema } from './tokensWhereUniqueInputSchema';
import { tokensUpdateWithoutUserInputSchema } from './tokensUpdateWithoutUserInputSchema';
import { tokensUncheckedUpdateWithoutUserInputSchema } from './tokensUncheckedUpdateWithoutUserInputSchema';

export const tokensUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.tokensUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => tokensWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => tokensUpdateWithoutUserInputSchema), z.lazy(() => tokensUncheckedUpdateWithoutUserInputSchema) ]),
});

export default tokensUpdateWithWhereUniqueWithoutUserInputSchema;
