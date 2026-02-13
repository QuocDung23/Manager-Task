import { z } from 'zod';

export const TokensScalarFieldEnumSchema = z.enum(['id','userId','refreshToken']);

export default TokensScalarFieldEnumSchema;
