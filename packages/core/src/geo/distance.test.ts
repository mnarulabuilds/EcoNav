import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  buildDistanceMatrix,
  travelTimeMinutes,
  calculateRouteCost,
} from './distance.js';

describe('haversineDistance', () => {
  it('returns 0 for identical points', () => {
    const point = { lat: 28.6139, lng: 77.209 };
    expect(haversineDistance(point, point)).toBe(0);
  });

  it('calculates known distance between Delhi and Mumbai', () => {
    const delhi = { lat: 28.6139, lng: 77.209 };
    const mumbai = { lat: 19.076, lng: 72.8777 };
    const distance = haversineDistance(delhi, mumbai);
    expect(distance).toBeGreaterThan(1100);
    expect(distance).toBeLessThan(1200);
  });

  it('is symmetric', () => {
    const a = { lat: 12.9716, lng: 77.5946 };
    const b = { lat: 13.0827, lng: 80.2707 };
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 5);
  });
});

describe('buildDistanceMatrix', () => {
  it('builds symmetric matrix with zero diagonal', () => {
    const depot = { lat: 28.6139, lng: 77.209 };
    const sites = [
      { lat: 28.7041, lng: 77.1025 },
      { lat: 28.5355, lng: 77.391 },
    ];
    const matrix = buildDistanceMatrix(depot, sites);

    expect(matrix.length).toBe(3);
    expect(matrix[0][0]).toBe(0);
    expect(matrix[1][1]).toBe(0);
    expect(matrix[2][2]).toBe(0);
    expect(matrix[1][2]).toBeCloseTo(matrix[2][1], 5);
  });
});

describe('travelTimeMinutes', () => {
  it('calculates travel time correctly', () => {
    expect(travelTimeMinutes(40, 40)).toBeCloseTo(60, 1);
    expect(travelTimeMinutes(20, 60)).toBeCloseTo(20, 1);
  });

  it('throws for zero or negative speed', () => {
    expect(() => travelTimeMinutes(10, 0)).toThrow('Vehicle speed must be positive');
    expect(() => travelTimeMinutes(10, -5)).toThrow('Vehicle speed must be positive');
  });
});

describe('calculateRouteCost', () => {
  it('combines distance and time costs', () => {
    const cost = calculateRouteCost(100, 120, 2.5, 500);
    expect(cost).toBe(1250);
  });
});
