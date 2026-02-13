import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { tokensSelectSchema } from '../inputTypeSchemas/tokensSelectSchema';
import { tokensIncludeSchema } from '../inputTypeSchemas/tokensIncludeSchema';

export const tokensArgsSchema: z.ZodType<Prisma.tokensDefaultArgs> = z.object({
  select: z.lazy(() => tokensSelectSchema).optional(),
  include: z.lazy(() => tokensIncludeSchema).optional(),
}).strict();

export default tokensArgsSchema;
