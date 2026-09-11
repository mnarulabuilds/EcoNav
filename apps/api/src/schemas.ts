import { z } from 'zod';

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const depotSchema = geoPointSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const collectionSiteSchema = geoPointSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  demandKg: z.number().positive(),
});

export const vehicleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capacityKg: z.number().positive(),
  speedKmh: z.number().positive(),
});

export const routePlannerConfigSchema = z.object({
  criterion: z.enum(['distance', 'time', 'cost', 'balanced']).default('balanced'),
  serviceTimeMinutes: z.number().min(0).default(10),
  costPerKm: z.number().min(0).default(2.5),
  costPerHour: z.number().min(0).default(500),
});

export const routePlanRequestSchema = z.object({
  depot: depotSchema,
  sites: z.array(collectionSiteSchema).min(0),
  vehicles: z.array(vehicleSchema).min(1),
  config: routePlannerConfigSchema.optional(),
});

export type RoutePlanRequest = z.infer<typeof routePlanRequestSchema>;
