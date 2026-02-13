import { z } from 'zod';

export const AccountsScalarFieldEnumSchema = z.enum(['id','userId','password','salt']);

export default AccountsScalarFieldEnumSchema;
