import { z } from 'zod';
import { UserStatusSchema } from '../inputTypeSchemas/UserStatusSchema'
import { accountsWithRelationsSchema, accountsPartialWithRelationsSchema, accountsOptionalDefaultsWithRelationsSchema } from './accountsSchema'
import type { accountsWithRelations, accountsPartialWithRelations, accountsOptionalDefaultsWithRelations } from './accountsSchema'
import { tokensWithRelationsSchema, tokensPartialWithRelationsSchema, tokensOptionalDefaultsWithRelationsSchema } from './tokensSchema'
import type { tokensWithRelations, tokensPartialWithRelations, tokensOptionalDefaultsWithRelations } from './tokensSchema'

/////////////////////////////////////////
// USERS SCHEMA
/////////////////////////////////////////

export const usersSchema = z.object({
  status: UserStatusSchema,
  id: z.string(),
  name: z.string(),
  email: z.string(),
  bio: z.string().nullish(),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  avatar: z.string().nullish(),
  verify: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
})

export type users = z.infer<typeof usersSchema>

/////////////////////////////////////////
// USERS PARTIAL SCHEMA
/////////////////////////////////////////

export const usersPartialSchema = usersSchema.partial()

export type usersPartial = z.infer<typeof usersPartialSchema>

/////////////////////////////////////////
// USERS OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const usersOptionalDefaultsSchema = usersSchema.merge(z.object({
  status: UserStatusSchema.optional(),
  id: z.string().optional(),
  verify: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type usersOptionalDefaults = z.infer<typeof usersOptionalDefaultsSchema>

/////////////////////////////////////////
// USERS RELATION SCHEMA
/////////////////////////////////////////

export type usersRelations = {
  accounts?: accountsWithRelations | null;
  tokens: tokensWithRelations[];
};

export type usersWithRelations = z.infer<typeof usersSchema> & usersRelations

export const usersWithRelationsSchema: z.ZodType<usersWithRelations> = usersSchema.merge(z.object({
  accounts: z.lazy(() => accountsWithRelationsSchema).nullish(),
  tokens: z.lazy(() => tokensWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USERS OPTIONAL DEFAULTS RELATION SCHEMA
/////////////////////////////////////////

export type usersOptionalDefaultsRelations = {
  accounts?: accountsOptionalDefaultsWithRelations | null;
  tokens: tokensOptionalDefaultsWithRelations[];
};

export type usersOptionalDefaultsWithRelations = z.infer<typeof usersOptionalDefaultsSchema> & usersOptionalDefaultsRelations

export const usersOptionalDefaultsWithRelationsSchema: z.ZodType<usersOptionalDefaultsWithRelations> = usersOptionalDefaultsSchema.merge(z.object({
  accounts: z.lazy(() => accountsOptionalDefaultsWithRelationsSchema).nullish(),
  tokens: z.lazy(() => tokensOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USERS PARTIAL RELATION SCHEMA
/////////////////////////////////////////

export type usersPartialRelations = {
  accounts?: accountsPartialWithRelations | null;
  tokens?: tokensPartialWithRelations[];
};

export type usersPartialWithRelations = z.infer<typeof usersPartialSchema> & usersPartialRelations

export const usersPartialWithRelationsSchema: z.ZodType<usersPartialWithRelations> = usersPartialSchema.merge(z.object({
  accounts: z.lazy(() => accountsPartialWithRelationsSchema).nullish(),
  tokens: z.lazy(() => tokensPartialWithRelationsSchema).array(),
})).partial()

export type usersOptionalDefaultsWithPartialRelations = z.infer<typeof usersOptionalDefaultsSchema> & usersPartialRelations

export const usersOptionalDefaultsWithPartialRelationsSchema: z.ZodType<usersOptionalDefaultsWithPartialRelations> = usersOptionalDefaultsSchema.merge(z.object({
  accounts: z.lazy(() => accountsPartialWithRelationsSchema).nullish(),
  tokens: z.lazy(() => tokensPartialWithRelationsSchema).array(),
}).partial())

export type usersWithPartialRelations = z.infer<typeof usersSchema> & usersPartialRelations

export const usersWithPartialRelationsSchema: z.ZodType<usersWithPartialRelations> = usersSchema.merge(z.object({
  accounts: z.lazy(() => accountsPartialWithRelationsSchema).nullish(),
  tokens: z.lazy(() => tokensPartialWithRelationsSchema).array(),
}).partial())

export default usersSchema;
