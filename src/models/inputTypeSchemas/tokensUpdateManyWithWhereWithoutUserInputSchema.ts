import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensScalarWhereInputSchema } from './tokensScalarWhereInputSchema';
import { tokensUpdateManyMutationInputSchema } from './tokensUpdateManyMutationInputSchema';
import { tokensUncheckedUpdateManyWithoutUserInputSchema } from './tokensUncheckedUpdateManyWithoutUserInputSchema';

export const tokensUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.tokensUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => tokensScalarWhereInputSchema),
  data: z.union([ z.lazy(() => tokensUpdateManyMutationInputSchema), z.lazy(() => tokensUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export default tokensUpdateManyWithWhereWithoutUserInputSchema;
