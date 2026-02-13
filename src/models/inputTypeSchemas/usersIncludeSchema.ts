import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { accountsArgsSchema } from "../outputTypeSchemas/accountsArgsSchema"
import { tokensFindManyArgsSchema } from "../outputTypeSchemas/tokensFindManyArgsSchema"
import { UsersCountOutputTypeArgsSchema } from "../outputTypeSchemas/UsersCountOutputTypeArgsSchema"

export const usersIncludeSchema: z.ZodType<Prisma.usersInclude> = z.object({
  accounts: z.union([z.boolean(),z.lazy(() => accountsArgsSchema)]).optional(),
  tokens: z.union([z.boolean(),z.lazy(() => tokensFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict();

export default usersIncludeSchema;
