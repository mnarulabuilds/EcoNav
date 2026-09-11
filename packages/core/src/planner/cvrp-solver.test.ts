import { describe, it, expect } from 'vitest';
import { CVRPSolver } from './cvrp-solver.js';
import type { RoutePlanInput } from '../types.js';

const defaultConfig = {
  criterion: 'balanced' as const,
  serviceTimeMinutes: 10,
  costPerKm: 2.5,
  costPerHour: 500,
};

const depot = {
  id: 'depot-1',
  name: 'Central Depot',
  lat: 28.6139,
  lng: 77.209,
};

describe('CVRPSolver', () => {
  const solver = new CVRPSolver();

  it('returns empty result when no sites provided', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [],
      vehicles: [{ id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 }],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    expect(result.routes).toHaveLength(0);
    expect(result.unassignedSites).toHaveLength(0);
    expect(result.summary.totalSitesAssigned).toBe(0);
  });

  it('assigns all sites when capacity is sufficient', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
        { id: 's2', name: 'Site B', lat: 28.5355, lng: 77.391, demandKg: 800 },
        { id: 's3', name: 'Site C', lat: 28.4595, lng: 77.0266, demandKg: 600 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
        { id: 'v2', name: 'Truck 2', capacityKg: 5000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    expect(result.summary.totalSitesAssigned).toBe(3);
    expect(result.summary.totalSitesUnassigned).toBe(0);
    expect(result.summary.totalWasteCollectedKg).toBe(1900);
  });

  it('respects vehicle capacity constraints on every route', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 3000 },
        { id: 's2', name: 'Site B', lat: 28.5355, lng: 77.391, demandKg: 3000 },
        { id: 's3', name: 'Site C', lat: 28.4595, lng: 77.0266, demandKg: 3000 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 4000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    for (const route of result.routes) {
      expect(route.totalLoadKg).toBeLessThanOrEqual(route.vehicleCapacityKg);
    }
    // Single vehicle can make multiple trips; each trip must stay within capacity
    expect(result.summary.totalSitesAssigned).toBe(3);
  });

  it('never merges sites that would exceed vehicle capacity', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 2500 },
        { id: 's2', name: 'Site B', lat: 28.7050, lng: 77.1030, demandKg: 2500 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 4000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    const multiStopRoute = result.routes.find((r) => r.stops.length > 1);
    if (multiStopRoute) {
      expect(multiStopRoute.totalLoadKg).toBeLessThanOrEqual(4000);
    }
    for (const route of result.routes) {
      expect(route.totalLoadKg).toBeLessThanOrEqual(route.vehicleCapacityKg);
    }
  });

  it('does not exceed capacity on any route', () => {
    const input: RoutePlanInput = {
      depot,
      sites: Array.from({ length: 8 }, (_, i) => ({
        id: `s${i}`,
        name: `Site ${i}`,
        lat: 28.6139 + (i * 0.02),
        lng: 77.209 + (i * 0.02),
        demandKg: 400 + i * 100,
      })),
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 2000, speedKmh: 40 },
        { id: 'v2', name: 'Truck 2', capacityKg: 2000, speedKmh: 40 },
        { id: 'v3', name: 'Truck 3', capacityKg: 2000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    for (const route of result.routes) {
      expect(route.totalLoadKg).toBeLessThanOrEqual(route.vehicleCapacityKg);
    }
  });

  it('builds valid route paths starting and ending at depot', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
        { id: 's2', name: 'Site B', lat: 28.5355, lng: 77.391, demandKg: 800 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    for (const route of result.routes) {
      if (route.stops.length === 0) continue;
      expect(route.path[0]).toEqual({ lat: depot.lat, lng: depot.lng });
      expect(route.path[route.path.length - 1]).toEqual({ lat: depot.lat, lng: depot.lng });
      expect(route.path.length).toBe(route.stops.length + 2);
    }
  });

  it('calculates positive distance and cost for assigned routes', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    expect(result.routes.length).toBeGreaterThan(0);
    const route = result.routes[0];
    expect(route.totalDistanceKm).toBeGreaterThan(0);
    expect(route.totalCost).toBeGreaterThan(0);
    expect(route.totalDurationMinutes).toBeGreaterThan(0);
  });

  it('throws for invalid input', () => {
    expect(() =>
      solver.plan({
        depot,
        sites: [{ id: 's1', name: 'Bad', lat: 28.7, lng: 77.1, demandKg: -100 }],
        vehicles: [{ id: 'v1', name: 'Truck', capacityKg: 5000, speedKmh: 40 }],
        config: defaultConfig,
      }),
    ).toThrow('positive demand');

    expect(() =>
      solver.plan({
        depot,
        sites: [],
        vehicles: [],
        config: defaultConfig,
      }),
    ).toThrow('At least one vehicle is required');
  });

  it('leaves oversized sites unassigned', () => {
    const input: RoutePlanInput = {
      depot,
      sites: [
        { id: 's1', name: 'Huge Site', lat: 28.7041, lng: 77.1025, demandKg: 10000 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
      ],
      config: defaultConfig,
    };

    const result = solver.plan(input);
    expect(result.unassignedSites).toHaveLength(1);
    expect(result.summary.totalWasteUnassignedKg).toBe(10000);
  });
});
