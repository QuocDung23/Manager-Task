import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensCreateWithoutUserInputSchema } from './tokensCreateWithoutUserInputSchema';
import { tokensUncheckedCreateWithoutUserInputSchema } from './tokensUncheckedCreateWithoutUserInputSchema';
import { tokensCreateOrConnectWithoutUserInputSchema } from './tokensCreateOrConnectWithoutUserInputSchema';
import { tokensCreateManyUserInputEnvelopeSchema } from './tokensCreateManyUserInputEnvelopeSchema';
import { tokensWhereUniqueInputSchema } from './tokensWhereUniqueInputSchema';

export const tokensCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.tokensCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => tokensCreateWithoutUserInputSchema), z.lazy(() => tokensCreateWithoutUserInputSchema).array(), z.lazy(() => tokensUncheckedCreateWithoutUserInputSchema), z.lazy(() => tokensUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => tokensCreateOrConnectWithoutUserInputSchema), z.lazy(() => tokensCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => tokensCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => tokensWhereUniqueInputSchema), z.lazy(() => tokensWhereUniqueInputSchema).array() ]).optional(),
});

export default tokensCreateNestedManyWithoutUserInputSchema;
