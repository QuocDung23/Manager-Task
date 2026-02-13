import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { tokensCreateWithoutUserInputSchema } from './tokensCreateWithoutUserInputSchema';
import { tokensUncheckedCreateWithoutUserInputSchema } from './tokensUncheckedCreateWithoutUserInputSchema';
import { tokensCreateOrConnectWithoutUserInputSchema } from './tokensCreateOrConnectWithoutUserInputSchema';
import { tokensUpsertWithWhereUniqueWithoutUserInputSchema } from './tokensUpsertWithWhereUniqueWithoutUserInputSchema';
import { tokensCreateManyUserInputEnvelopeSchema } from './tokensCreateManyUserInputEnvelopeSchema';
import { tokensWhereUniqueInputSchema } from './tokensWhereUniqueInputSchema';
import { tokensUpdateWithWhereUniqueWithoutUserInputSchema } from './tokensUpdateWithWhereUniqueWithoutUserInputSchema';
import { tokensUpdateManyWithWhereWithoutUserInputSchema } from './tokensUpdateManyWithWhereWithoutUserInputSchema';
import { tokensScalarWhereInputSchema } from './tokensScalarWhereInputSchema';

export const tokensUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.tokensUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => tokensCreateWithoutUserInputSchema), z.lazy(() => tokensCreateWithoutUserInputSchema).array(), z.lazy(() => tokensUncheckedCreateWithoutUserInputSchema), z.lazy(() => tokensUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => tokensCreateOrConnectWithoutUserInputSchema), z.lazy(() => tokensCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => tokensUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => tokensUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => tokensCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => tokensWhereUniqueInputSchema), z.lazy(() => tokensWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => tokensWhereUniqueInputSchema), z.lazy(() => tokensWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => tokensWhereUniqueInputSchema), z.lazy(() => tokensWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => tokensWhereUniqueInputSchema), z.lazy(() => tokensWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => tokensUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => tokensUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => tokensUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => tokensUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => tokensScalarWhereInputSchema), z.lazy(() => tokensScalarWhereInputSchema).array() ]).optional(),
});

export default tokensUncheckedUpdateManyWithoutUserNestedInputSchema;
