import { z } from 'zod';
import { countryRefSchema, nullableString } from './primitives';

export const organizationRefSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
  })
  .strict();

export const soccerOrganizationCreateSchema = z
  .object({
    name: z.string().min(1),
    logo: nullableString.optional(),
    country: countryRefSchema,
  })
  .strict();

export const soccerOrganizationUpdateSchema = z
  .object({
    name: z.string().min(1),
    logo: nullableString.optional(),
  })
  .strict();

export type SoccerOrganizationCreate = z.infer<typeof soccerOrganizationCreateSchema>;
export type SoccerOrganizationUpdate = z.infer<typeof soccerOrganizationUpdateSchema>;
export type OrganizationRef = z.infer<typeof organizationRefSchema>;
