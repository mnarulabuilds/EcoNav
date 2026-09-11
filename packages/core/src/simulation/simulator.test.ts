import { describe, it, expect } from 'vitest';
import { CVRPSolver } from '../planner/cvrp-solver.js';
import { RouteSimulator } from './simulator.js';

const depot = {
  id: 'depot-1',
  name: 'Central Depot',
  lat: 28.6139,
  lng: 77.209,
};

describe('RouteSimulator', () => {
  const solver = new CVRPSolver();
  const simulator = new RouteSimulator();

  it('generates events for each route', () => {
    const plan = solver.plan({
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
        { id: 's2', name: 'Site B', lat: 28.5355, lng: 77.391, demandKg: 800 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
      ],
      config: {
        criterion: 'balanced',
        serviceTimeMinutes: 10,
        costPerKm: 2.5,
        costPerHour: 500,
      },
    });

    const timeline = simulator.simulate(plan, depot);
    expect(timeline.events.length).toBeGreaterThan(0);
    expect(timeline.vehicleCount).toBeGreaterThan(0);

    const startEvents = timeline.events.filter((e) => e.type === 'route_start');
    expect(startEvents.length).toBe(timeline.vehicleCount);

    const completeEvents = timeline.events.filter((e) => e.type === 'route_complete');
    expect(completeEvents.length).toBe(timeline.vehicleCount);
  });

  it('orders events chronologically', () => {
    const plan = solver.plan({
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
      ],
      config: {
        criterion: 'distance',
        serviceTimeMinutes: 10,
        costPerKm: 2.5,
        costPerHour: 500,
      },
    });

    const timeline = simulator.simulate(plan, depot);
    for (let i = 1; i < timeline.events.length; i++) {
      expect(timeline.events[i].timestampMinutes).toBeGreaterThanOrEqual(
        timeline.events[i - 1].timestampMinutes,
      );
    }
  });

  it('tracks load increasing after collection', () => {
    const plan = solver.plan({
      depot,
      sites: [
        { id: 's1', name: 'Site A', lat: 28.7041, lng: 77.1025, demandKg: 500 },
      ],
      vehicles: [
        { id: 'v1', name: 'Truck 1', capacityKg: 5000, speedKmh: 40 },
      ],
      config: {
        criterion: 'time',
        serviceTimeMinutes: 10,
        costPerKm: 2.5,
        costPerHour: 500,
      },
    });

    const timeline = simulator.simulate(plan, depot);
    const departed = timeline.events.find((e) => e.type === 'departed');
    expect(departed?.loadKg).toBe(500);

    const complete = timeline.events.find((e) => e.type === 'route_complete');
    expect(complete?.loadKg).toBe(500);
  });
});
