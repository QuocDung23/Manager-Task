import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserStatusSchema } from './UserStatusSchema';

export const EnumUserStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => UserStatusSchema).optional(),
});

export default EnumUserStatusFieldUpdateOperationsInputSchema;
