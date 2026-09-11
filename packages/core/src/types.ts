/** Geographic coordinate on the Earth's surface */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Depot where vehicles start and end their routes */
export interface Depot extends GeoPoint {
  id: string;
  name: string;
}

/** Waste collection site with demand in kilograms */
export interface CollectionSite extends GeoPoint {
  id: string;
  name: string;
  /** Amount of waste to collect in kilograms */
  demandKg: number;
}

/** Vehicle available for waste collection */
export interface Vehicle {
  id: string;
  name: string;
  /** Maximum load capacity in kilograms */
  capacityKg: number;
  /** Average travel speed in km/h */
  speedKmh: number;
}

/** Optimization criterion for route planning */
export type OptimizationCriterion = 'distance' | 'time' | 'cost' | 'balanced';

/** Configuration for route planning */
export interface RoutePlannerConfig {
  /** Optimization criterion */
  criterion: OptimizationCriterion;
  /** Time spent at each collection site in minutes */
  serviceTimeMinutes: number;
  /** Cost per kilometer traveled */
  costPerKm: number;
  /** Cost per hour of operation (labor + vehicle) */
  costPerHour: number;
}

/** A single stop in a vehicle route */
export interface RouteStop {
  siteId: string;
  siteName: string;
  lat: number;
  lng: number;
  demandKg: number;
  /** Cumulative load after collecting at this stop */
  cumulativeLoadKg: number;
  /** Distance from previous stop in km */
  distanceFromPreviousKm: number;
  /** Travel time from previous stop in minutes */
  travelTimeMinutes: number;
  /** Service time at this stop in minutes */
  serviceTimeMinutes: number;
  /** Arrival time offset from route start in minutes */
  arrivalTimeMinutes: number;
}

/** Complete route assigned to a vehicle */
export interface VehicleRoute {
  vehicleId: string;
  vehicleName: string;
  vehicleCapacityKg: number;
  stops: RouteStop[];
  /** Total distance in km (including return to depot) */
  totalDistanceKm: number;
  /** Total travel time in minutes */
  totalTravelTimeMinutes: number;
  /** Total service time in minutes */
  totalServiceTimeMinutes: number;
  /** Total route duration in minutes */
  totalDurationMinutes: number;
  /** Total waste collected in kg */
  totalLoadKg: number;
  /** Estimated cost for this route */
  totalCost: number;
  /** Ordered path coordinates for map rendering [depot, ...stops, depot] */
  path: GeoPoint[];
}

/** Result of route optimization */
export interface RoutePlanResult {
  routes: VehicleRoute[];
  unassignedSites: CollectionSite[];
  summary: RoutePlanSummary;
  /** Distance matrix used for optimization (for debugging) */
  distanceMatrixKm?: number[][];
}

/** Aggregate summary of the route plan */
export interface RoutePlanSummary {
  totalVehiclesUsed: number;
  totalSitesAssigned: number;
  totalSitesUnassigned: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalCost: number;
  totalWasteCollectedKg: number;
  totalWasteUnassignedKg: number;
  averageVehicleUtilization: number;
}

/** Input for route planning */
export interface RoutePlanInput {
  depot: Depot;
  sites: CollectionSite[];
  vehicles: Vehicle[];
  config: RoutePlannerConfig;
}

/** Simulation event types */
export type SimulationEventType =
  | 'route_start'
  | 'traveling'
  | 'arrived'
  | 'collecting'
  | 'departed'
  | 'route_complete';

/** A single event in the route simulation */
export interface SimulationEvent {
  type: SimulationEventType;
  vehicleId: string;
  vehicleName: string;
  siteId?: string;
  siteName?: string;
  lat: number;
  lng: number;
  timestampMinutes: number;
  loadKg: number;
  message: string;
}

/** Complete simulation timeline */
export interface SimulationTimeline {
  events: SimulationEvent[];
  totalDurationMinutes: number;
  vehicleCount: number;
}
