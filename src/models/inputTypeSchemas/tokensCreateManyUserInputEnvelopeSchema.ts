import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensCreateManyUserInputSchema } from './tokensCreateManyUserInputSchema';

export const tokensCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.tokensCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => tokensCreateManyUserInputSchema), z.lazy(() => tokensCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default tokensCreateManyUserInputEnvelopeSchema;
