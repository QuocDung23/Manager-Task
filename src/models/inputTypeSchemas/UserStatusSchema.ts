import { z } from 'zod';

export const UserStatusSchema = z.enum(['ACTIVE','LOCKED']);

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

export default UserStatusSchema;
