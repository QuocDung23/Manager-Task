import { z } from 'zod';
import { usersWithRelationsSchema, usersPartialWithRelationsSchema, usersOptionalDefaultsWithRelationsSchema } from './usersSchema'
import type { usersWithRelations, usersPartialWithRelations, usersOptionalDefaultsWithRelations } from './usersSchema'

/////////////////////////////////////////
// TOKENS SCHEMA
/////////////////////////////////////////

export const tokensSchema = z.object({
  id: z.string(),
  userId: z.string(),
  refreshToken: z.string(),
})

export type tokens = z.infer<typeof tokensSchema>

/////////////////////////////////////////
// TOKENS PARTIAL SCHEMA
/////////////////////////////////////////

export const tokensPartialSchema = tokensSchema.partial()

export type tokensPartial = z.infer<typeof tokensPartialSchema>

/////////////////////////////////////////
// TOKENS OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const tokensOptionalDefaultsSchema = tokensSchema.merge(z.object({
  id: z.string().optional(),
}))

export type tokensOptionalDefaults = z.infer<typeof tokensOptionalDefaultsSchema>

/////////////////////////////////////////
// TOKENS RELATION SCHEMA
/////////////////////////////////////////

export type tokensRelations = {
  user: usersWithRelations;
};

export type tokensWithRelations = z.infer<typeof tokensSchema> & tokensRelations

export const tokensWithRelationsSchema: z.ZodType<tokensWithRelations> = tokensSchema.merge(z.object({
  user: z.lazy(() => usersWithRelationsSchema),
}))

/////////////////////////////////////////
// TOKENS OPTIONAL DEFAULTS RELATION SCHEMA
/////////////////////////////////////////

export type tokensOptionalDefaultsRelations = {
  user: usersOptionalDefaultsWithRelations;
};

export type tokensOptionalDefaultsWithRelations = z.infer<typeof tokensOptionalDefaultsSchema> & tokensOptionalDefaultsRelations

export const tokensOptionalDefaultsWithRelationsSchema: z.ZodType<tokensOptionalDefaultsWithRelations> = tokensOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => usersOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// TOKENS PARTIAL RELATION SCHEMA
/////////////////////////////////////////

export type tokensPartialRelations = {
  user?: usersPartialWithRelations;
};

export type tokensPartialWithRelations = z.infer<typeof tokensPartialSchema> & tokensPartialRelations

export const tokensPartialWithRelationsSchema: z.ZodType<tokensPartialWithRelations> = tokensPartialSchema.merge(z.object({
  user: z.lazy(() => usersPartialWithRelationsSchema),
})).partial()

export type tokensOptionalDefaultsWithPartialRelations = z.infer<typeof tokensOptionalDefaultsSchema> & tokensPartialRelations

export const tokensOptionalDefaultsWithPartialRelationsSchema: z.ZodType<tokensOptionalDefaultsWithPartialRelations> = tokensOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => usersPartialWithRelationsSchema),
}).partial())

export type tokensWithPartialRelations = z.infer<typeof tokensSchema> & tokensPartialRelations

export const tokensWithPartialRelationsSchema: z.ZodType<tokensWithPartialRelations> = tokensSchema.merge(z.object({
  user: z.lazy(() => usersPartialWithRelationsSchema),
}).partial())

export default tokensSchema;
