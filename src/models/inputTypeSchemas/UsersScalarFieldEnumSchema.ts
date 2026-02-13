import { z } from 'zod';

export const UsersScalarFieldEnumSchema = z.enum(['id','name','email','bio','address','phone','avatar','verify','status','createdAt','updatedAt','deletedAt']);

export default UsersScalarFieldEnumSchema;
