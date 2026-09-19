import { describe, expect, it } from 'vitest';
import { routePlanRequestSchema } from './schemas.js';

describe('routePlanRequestSchema', () => {
  const valid = {
    depot: { id: 'd1', name: 'Depot', lat: 28.6, lng: 77.2 },
    sites: [{ id: 's1', name: 'Site', lat: 28.7, lng: 77.1, demandKg: 100 }],
    vehicles: [{ id: 'v1', name: 'Truck', capacityKg: 1000, speedKmh: 40 }],
  };

  it('accepts valid payload', () => {
    const parsed = routePlanRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects empty vehicles', () => {
    const parsed = routePlanRequestSchema.safeParse({ ...valid, vehicles: [] });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid coordinates', () => {
    const parsed = routePlanRequestSchema.safeParse({
      ...valid,
      depot: { ...valid.depot, lat: 100 },
    });
    expect(parsed.success).toBe(false);
  });

  it('applies defaults when config partial', () => {
    const parsed = routePlanRequestSchema.parse({
      ...valid,
      config: { criterion: 'distance' },
    });
    expect(parsed.config?.criterion).toBe('distance');
    expect(parsed.config?.serviceTimeMinutes).toBe(10);
    expect(parsed.config?.costPerKm).toBe(2.5);
  });
});
