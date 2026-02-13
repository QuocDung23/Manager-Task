import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensWhereUniqueInputSchema } from './tokensWhereUniqueInputSchema';
import { tokensUpdateWithoutUserInputSchema } from './tokensUpdateWithoutUserInputSchema';
import { tokensUncheckedUpdateWithoutUserInputSchema } from './tokensUncheckedUpdateWithoutUserInputSchema';
import { tokensCreateWithoutUserInputSchema } from './tokensCreateWithoutUserInputSchema';
import { tokensUncheckedCreateWithoutUserInputSchema } from './tokensUncheckedCreateWithoutUserInputSchema';

export const tokensUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.tokensUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => tokensWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => tokensUpdateWithoutUserInputSchema), z.lazy(() => tokensUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => tokensCreateWithoutUserInputSchema), z.lazy(() => tokensUncheckedCreateWithoutUserInputSchema) ]),
});

export default tokensUpsertWithWhereUniqueWithoutUserInputSchema;
