import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { accountsCreateWithoutUserInputSchema } from './accountsCreateWithoutUserInputSchema';
import { accountsUncheckedCreateWithoutUserInputSchema } from './accountsUncheckedCreateWithoutUserInputSchema';
import { accountsCreateOrConnectWithoutUserInputSchema } from './accountsCreateOrConnectWithoutUserInputSchema';
import { accountsUpsertWithoutUserInputSchema } from './accountsUpsertWithoutUserInputSchema';
import { accountsWhereInputSchema } from './accountsWhereInputSchema';
import { accountsWhereUniqueInputSchema } from './accountsWhereUniqueInputSchema';
import { accountsUpdateToOneWithWhereWithoutUserInputSchema } from './accountsUpdateToOneWithWhereWithoutUserInputSchema';
import { accountsUpdateWithoutUserInputSchema } from './accountsUpdateWithoutUserInputSchema';
import { accountsUncheckedUpdateWithoutUserInputSchema } from './accountsUncheckedUpdateWithoutUserInputSchema';

export const accountsUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.accountsUpdateOneWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => accountsCreateWithoutUserInputSchema), z.lazy(() => accountsUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => accountsCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => accountsUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => accountsWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => accountsWhereInputSchema) ]).optional(),
  connect: z.lazy(() => accountsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => accountsUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => accountsUpdateWithoutUserInputSchema), z.lazy(() => accountsUncheckedUpdateWithoutUserInputSchema) ]).optional(),
});

export default accountsUpdateOneWithoutUserNestedInputSchema;
