import type { GeoPoint } from '../types.js';

const EARTH_RADIUS_KM = 6371;

/** Convert degrees to radians */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the great-circle distance between two points using the Haversine formula.
 * @returns Distance in kilometers
 */
export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Build a symmetric distance matrix for all locations.
 * Index 0 is depot, indices 1..n are collection sites.
 */
export function buildDistanceMatrix(
  depot: GeoPoint,
  sites: GeoPoint[],
): number[][] {
  const locations = [depot, ...sites];
  const n = locations.length;
  const matrix: number[][] = Array.from({ length: n }, () =>
    Array<number>(n).fill(0),
  );

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = haversineDistance(locations[i], locations[j]);
      matrix[i][j] = dist;
      matrix[j][i] = dist;
    }
  }

  return matrix;
}

/**
 * Calculate travel time in minutes given distance and speed.
 */
export function travelTimeMinutes(distanceKm: number, speedKmh: number): number {
  if (speedKmh <= 0) {
    throw new Error('Vehicle speed must be positive');
  }
  return (distanceKm / speedKmh) * 60;
}

/**
 * Calculate route cost based on distance and time.
 */
export function calculateRouteCost(
  distanceKm: number,
  durationMinutes: number,
  costPerKm: number,
  costPerHour: number,
): number {
  const timeCost = (durationMinutes / 60) * costPerHour;
  const distanceCost = distanceKm * costPerKm;
  return Math.round((timeCost + distanceCost) * 100) / 100;
}
