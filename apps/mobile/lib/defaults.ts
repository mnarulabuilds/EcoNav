import type { CollectionSite, Depot, Vehicle } from '@econav/core';

export const DEFAULT_DEPOT: Depot = {
  id: 'depot-1',
  name: 'Central Waste Depot',
  lat: 28.6139,
  lng: 77.209,
};

export const DEFAULT_SITES: CollectionSite[] = [
  { id: 'site-1', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, demandKg: 850 },
  { id: 'site-2', name: 'Karol Bagh', lat: 28.6519, lng: 77.1909, demandKg: 1200 },
  { id: 'site-3', name: 'Lajpat Nagar', lat: 28.5677, lng: 77.2431, demandKg: 950 },
];

export const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 'vehicle-1', name: 'Truck Alpha', capacityKg: 3000, speedKmh: 35 },
  { id: 'vehicle-2', name: 'Truck Beta', capacityKg: 2500, speedKmh: 40 },
];

export const ROUTE_COLORS = ['#0f766e', '#7c3aed', '#dc2626', '#2563eb'];
