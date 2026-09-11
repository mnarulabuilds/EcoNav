import type {
  Depot,
  RoutePlanResult,
  SimulationEvent,
  SimulationTimeline,
  VehicleRoute,
} from '../types.js';

/**
 * Generates a step-by-step simulation timeline from a route plan.
 * Events are ordered chronologically across all vehicles.
 */
export class RouteSimulator {
  simulate(plan: RoutePlanResult, depot: Depot): SimulationTimeline {
    const events: SimulationEvent[] = [];

    for (const route of plan.routes) {
      if (route.stops.length === 0) continue;
      events.push(...this.simulateRoute(route, depot));
    }

    events.sort((a, b) => a.timestampMinutes - b.timestampMinutes);

    const totalDuration =
      events.length > 0
        ? Math.max(...events.map((e) => e.timestampMinutes))
        : 0;

    return {
      events,
      totalDurationMinutes: totalDuration,
      vehicleCount: plan.routes.filter((r) => r.stops.length > 0).length,
    };
  }

  private simulateRoute(route: VehicleRoute, depot: Depot): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    let currentLoad = 0;
    let currentTime = 0;

    events.push({
      type: 'route_start',
      vehicleId: route.vehicleId,
      vehicleName: route.vehicleName,
      lat: depot.lat,
      lng: depot.lng,
      timestampMinutes: currentTime,
      loadKg: currentLoad,
      message: `${route.vehicleName} departs from ${depot.name}`,
    });

    for (const stop of route.stops) {
      const travelStart = currentTime;
      const arrivalTime = stop.arrivalTimeMinutes;

      if (arrivalTime > travelStart) {
        events.push({
          type: 'traveling',
          vehicleId: route.vehicleId,
          vehicleName: route.vehicleName,
          siteId: stop.siteId,
          siteName: stop.siteName,
          lat: stop.lat,
          lng: stop.lng,
          timestampMinutes: travelStart,
          loadKg: currentLoad,
          message: `${route.vehicleName} traveling to ${stop.siteName}`,
        });
      }

      events.push({
        type: 'arrived',
        vehicleId: route.vehicleId,
        vehicleName: route.vehicleName,
        siteId: stop.siteId,
        siteName: stop.siteName,
        lat: stop.lat,
        lng: stop.lng,
        timestampMinutes: arrivalTime,
        loadKg: currentLoad,
        message: `${route.vehicleName} arrived at ${stop.siteName}`,
      });

      events.push({
        type: 'collecting',
        vehicleId: route.vehicleId,
        vehicleName: route.vehicleName,
        siteId: stop.siteId,
        siteName: stop.siteName,
        lat: stop.lat,
        lng: stop.lng,
        timestampMinutes: arrivalTime,
        loadKg: currentLoad,
        message: `${route.vehicleName} collecting ${stop.demandKg} kg at ${stop.siteName}`,
      });

      currentLoad += stop.demandKg;
      currentTime = arrivalTime + stop.serviceTimeMinutes;

      events.push({
        type: 'departed',
        vehicleId: route.vehicleId,
        vehicleName: route.vehicleName,
        siteId: stop.siteId,
        siteName: stop.siteName,
        lat: stop.lat,
        lng: stop.lng,
        timestampMinutes: currentTime,
        loadKg: currentLoad,
        message: `${route.vehicleName} departed ${stop.siteName} (${currentLoad} kg loaded)`,
      });
    }

    events.push({
      type: 'route_complete',
      vehicleId: route.vehicleId,
      vehicleName: route.vehicleName,
      lat: depot.lat,
      lng: depot.lng,
      timestampMinutes: route.totalDurationMinutes,
      loadKg: currentLoad,
      message: `${route.vehicleName} returned to depot with ${currentLoad} kg`,
    });

    return events;
  }
}
