import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';

export const tokensUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.tokensUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refreshToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export default tokensUncheckedUpdateManyWithoutUserInputSchema;
