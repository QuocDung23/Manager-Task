import { z } from 'zod';
import { usersWithRelationsSchema, usersPartialWithRelationsSchema, usersOptionalDefaultsWithRelationsSchema } from './usersSchema'
import type { usersWithRelations, usersPartialWithRelations, usersOptionalDefaultsWithRelations } from './usersSchema'

/////////////////////////////////////////
// ACCOUNTS SCHEMA
/////////////////////////////////////////

export const accountsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  password: z.string(),
  salt: z.string(),
})

export type accounts = z.infer<typeof accountsSchema>

/////////////////////////////////////////
// ACCOUNTS PARTIAL SCHEMA
/////////////////////////////////////////

export const accountsPartialSchema = accountsSchema.partial()

export type accountsPartial = z.infer<typeof accountsPartialSchema>

/////////////////////////////////////////
// ACCOUNTS OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const accountsOptionalDefaultsSchema = accountsSchema.merge(z.object({
  id: z.string().optional(),
}))

export type accountsOptionalDefaults = z.infer<typeof accountsOptionalDefaultsSchema>

/////////////////////////////////////////
// ACCOUNTS RELATION SCHEMA
/////////////////////////////////////////

export type accountsRelations = {
  user: usersWithRelations;
};

export type accountsWithRelations = z.infer<typeof accountsSchema> & accountsRelations

export const accountsWithRelationsSchema: z.ZodType<accountsWithRelations> = accountsSchema.merge(z.object({
  user: z.lazy(() => usersWithRelationsSchema),
}))

/////////////////////////////////////////
// ACCOUNTS OPTIONAL DEFAULTS RELATION SCHEMA
/////////////////////////////////////////

export type accountsOptionalDefaultsRelations = {
  user: usersOptionalDefaultsWithRelations;
};

export type accountsOptionalDefaultsWithRelations = z.infer<typeof accountsOptionalDefaultsSchema> & accountsOptionalDefaultsRelations

export const accountsOptionalDefaultsWithRelationsSchema: z.ZodType<accountsOptionalDefaultsWithRelations> = accountsOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => usersOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// ACCOUNTS PARTIAL RELATION SCHEMA
/////////////////////////////////////////

export type accountsPartialRelations = {
  user?: usersPartialWithRelations;
};

export type accountsPartialWithRelations = z.infer<typeof accountsPartialSchema> & accountsPartialRelations

export const accountsPartialWithRelationsSchema: z.ZodType<accountsPartialWithRelations> = accountsPartialSchema.merge(z.object({
  user: z.lazy(() => usersPartialWithRelationsSchema),
})).partial()

export type accountsOptionalDefaultsWithPartialRelations = z.infer<typeof accountsOptionalDefaultsSchema> & accountsPartialRelations

export const accountsOptionalDefaultsWithPartialRelationsSchema: z.ZodType<accountsOptionalDefaultsWithPartialRelations> = accountsOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => usersPartialWithRelationsSchema),
}).partial())

export type accountsWithPartialRelations = z.infer<typeof accountsSchema> & accountsPartialRelations

export const accountsWithPartialRelationsSchema: z.ZodType<accountsWithPartialRelations> = accountsSchema.merge(z.object({
  user: z.lazy(() => usersPartialWithRelationsSchema),
}).partial())

export default accountsSchema;
