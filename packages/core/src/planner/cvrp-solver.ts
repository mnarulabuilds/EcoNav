import {
  buildDistanceMatrix,
  calculateRouteCost,
  travelTimeMinutes,
} from '../geo/distance.js';
import type {
  CollectionSite,
  Depot,
  OptimizationCriterion,
  RoutePlanInput,
  RoutePlannerConfig,
  RoutePlanResult,
  RoutePlanSummary,
  RouteStop,
  Vehicle,
  VehicleRoute,
} from '../types.js';

interface InternalRoute {
  vehicle: Vehicle;
  siteIndices: number[];
  loadKg: number;
}

interface SavingsEntry {
  i: number;
  j: number;
  savings: number;
}

/**
 * Capacitated Vehicle Routing Problem solver using Clarke-Wright Savings Algorithm
 * with 2-opt local search improvement.
 */
export class CVRPSolver {
  plan(input: RoutePlanInput): RoutePlanResult {
    this.validateInput(input);

    const { depot, sites, vehicles, config } = input;

    if (sites.length === 0) {
      return this.emptyResult(vehicles);
    }

    const distanceMatrix = buildDistanceMatrix(depot, sites);
    const demands = sites.map((s) => s.demandKg);

    const routes = this.clarkeWrightSavings(
      distanceMatrix,
      demands,
      vehicles,
      config.criterion,
    );

    const improvedRoutes = routes.map((route) =>
      this.twoOptImprove(route, distanceMatrix, config.criterion),
    );

    const vehicleRoutes = improvedRoutes.map((route) =>
      this.buildVehicleRoute(
        route,
        depot,
        sites,
        distanceMatrix,
        config,
      ),
    );

    const assignedIndices = new Set(
      improvedRoutes.flatMap((r) => r.siteIndices),
    );
    const unassignedSites = sites.filter(
      (_, idx) => !assignedIndices.has(idx + 1),
    );

    const summary = this.buildSummary(
      vehicleRoutes,
      unassignedSites,
      sites.length,
    );

    return {
      routes: vehicleRoutes,
      unassignedSites,
      summary,
      distanceMatrixKm: distanceMatrix,
    };
  }

  private validateInput(input: RoutePlanInput): void {
    const { depot, sites, vehicles, config } = input;

    if (!depot.id || !depot.name) {
      throw new Error('Depot must have id and name');
    }
    if (vehicles.length === 0) {
      throw new Error('At least one vehicle is required');
    }
    if (config.serviceTimeMinutes < 0) {
      throw new Error('Service time cannot be negative');
    }

    for (const site of sites) {
      if (site.demandKg <= 0) {
        throw new Error(`Site ${site.id} must have positive demand`);
      }
    }

    for (const vehicle of vehicles) {
      if (vehicle.capacityKg <= 0) {
        throw new Error(`Vehicle ${vehicle.id} must have positive capacity`);
      }
      if (vehicle.speedKmh <= 0) {
        throw new Error(`Vehicle ${vehicle.id} must have positive speed`);
      }
    }

    const totalDemand = sites.reduce((sum, s) => sum + s.demandKg, 0);
    const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacityKg, 0);
    if (totalDemand > totalCapacity) {
      // Not an error — some sites may remain unassigned
    }
  }

  private emptyResult(_vehicles: Vehicle[]): RoutePlanResult {
    return {
      routes: [],
      unassignedSites: [],
      summary: {
        totalVehiclesUsed: 0,
        totalSitesAssigned: 0,
        totalSitesUnassigned: 0,
        totalDistanceKm: 0,
        totalDurationMinutes: 0,
        totalCost: 0,
        totalWasteCollectedKg: 0,
        totalWasteUnassignedKg: 0,
        averageVehicleUtilization: 0,
      },
    };
  }

  /**
   * Clarke-Wright Savings Algorithm for CVRP.
   * Site indices in distance matrix: 0 = depot, 1..n = sites.
   */
  private clarkeWrightSavings(
    distanceMatrix: number[][],
    demands: number[],
    vehicles: Vehicle[],
    criterion: OptimizationCriterion,
  ): InternalRoute[] {
    const n = demands.length;
    const savings: SavingsEntry[] = [];

    for (let i = 1; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        const saving =
          distanceMatrix[0][i] +
          distanceMatrix[0][j] -
          distanceMatrix[i][j];
        savings.push({ i, j, savings: saving });
      }
    }

    savings.sort((a, b) => {
      const diff = b.savings - a.savings;
      if (Math.abs(diff) > 0.001) return diff;
      return this.compareByCriterion(
        distanceMatrix[0][a.i] + distanceMatrix[0][a.j],
        distanceMatrix[0][b.i] + distanceMatrix[0][b.j],
        criterion,
      );
    });

    const routeMap = new Map<number, InternalRoute>();
    const siteToRoute = new Map<number, number>();

    for (let idx = 0; idx < n; idx++) {
      const siteIndex = idx + 1;
      const vehicle = this.selectVehicleForSite(
        vehicles,
        demands[idx],
        routeMap,
      );

      if (!vehicle) continue;

      const route: InternalRoute = {
        vehicle,
        siteIndices: [siteIndex],
        loadKg: demands[idx],
      };
      routeMap.set(siteIndex, route);
      siteToRoute.set(siteIndex, siteIndex);
    }

    for (const { i, j } of savings) {
      const routeI = siteToRoute.get(i);
      const routeJ = siteToRoute.get(j);

      if (routeI === undefined || routeJ === undefined) continue;
      if (routeI === routeJ) continue;

      const rI = routeMap.get(routeI)!;
      const rJ = routeMap.get(routeJ)!;

      if (rI.vehicle.id !== rJ.vehicle.id) continue;

      if (rI.loadKg + rJ.loadKg > rI.vehicle.capacityKg) continue;

      const mergedIndices = this.mergeRoutes(rI.siteIndices, rJ.siteIndices, i, j);
      if (mergedIndices === null) continue;

      const mergedRoute: InternalRoute = {
        vehicle: rI.vehicle,
        siteIndices: mergedIndices,
        loadKg: rI.loadKg + rJ.loadKg,
      };

      for (const idx of rJ.siteIndices) {
        siteToRoute.set(idx, routeI);
      }
      routeMap.set(routeI, mergedRoute);
      routeMap.delete(routeJ);
    }

    const uniqueRoutes = new Map<string, InternalRoute>();
    for (const route of routeMap.values()) {
      const key = route.siteIndices.slice().sort((a, b) => a - b).join(',');
      if (!uniqueRoutes.has(key)) {
        uniqueRoutes.set(key, route);
      }
    }

    return Array.from(uniqueRoutes.values());
  }

  private selectVehicleForSite(
    vehicles: Vehicle[],
    demand: number,
    existingRoutes: Map<number, InternalRoute>,
  ): Vehicle | null {
    const vehicleLoads = new Map<string, number>();
    for (const route of existingRoutes.values()) {
      const current = vehicleLoads.get(route.vehicle.id) ?? 0;
      vehicleLoads.set(route.vehicle.id, current + route.loadKg);
    }

    const sorted = [...vehicles].sort((a, b) => a.capacityKg - b.capacityKg);

    for (const vehicle of sorted) {
      const currentLoad = vehicleLoads.get(vehicle.id) ?? 0;
      if (currentLoad + demand <= vehicle.capacityKg) {
        return vehicle;
      }
    }

    for (const vehicle of sorted) {
      if (demand <= vehicle.capacityKg) {
        return vehicle;
      }
    }

    return null;
  }

  private mergeRoutes(
    routeA: number[],
    routeB: number[],
    i: number,
    j: number,
  ): number[] | null {
    const aEndsWithI = routeA[routeA.length - 1] === i;
    const aStartsWithJ = routeA[0] === j;
    const bEndsWithI = routeB[routeB.length - 1] === i;
    const bStartsWithJ = routeB[0] === j;

    if (aEndsWithI && bStartsWithJ) {
      return [...routeA, ...routeB];
    }
    if (bEndsWithI && aStartsWithJ) {
      return [...routeB, ...routeA];
    }
    const aEndsWithJ = routeA[routeA.length - 1] === j;
    const bEndsWithJ = routeB[routeB.length - 1] === j;

    if (aEndsWithI && bEndsWithJ) {
      return [...routeA, ...routeB.slice().reverse()];
    }
    if (bEndsWithI && aEndsWithJ) {
      return [...routeB, ...routeA.slice().reverse()];
    }

    return null;
  }

  private twoOptImprove(
    route: InternalRoute,
    distanceMatrix: number[][],
    criterion: OptimizationCriterion,
  ): InternalRoute {
    if (route.siteIndices.length < 3) return route;

    let improved = true;
    let bestIndices = [...route.siteIndices];

    while (improved) {
      improved = false;
      for (let i = 0; i < bestIndices.length - 1; i++) {
        for (let j = i + 2; j < bestIndices.length; j++) {
          const newIndices = this.twoOptSwap(bestIndices, i, j);
          const currentCost = this.routeCost(bestIndices, distanceMatrix, criterion);
          const newCost = this.routeCost(newIndices, distanceMatrix, criterion);

          if (newCost < currentCost - 0.001) {
            bestIndices = newIndices;
            improved = true;
          }
        }
      }
    }

    return { ...route, siteIndices: bestIndices };
  }

  private twoOptSwap(route: number[], i: number, j: number): number[] {
    const newRoute = [...route.slice(0, i + 1), ...route.slice(i + 1, j + 1).reverse(), ...route.slice(j + 1)];
    return newRoute;
  }

  private routeCost(
    siteIndices: number[],
    distanceMatrix: number[][],
    criterion: OptimizationCriterion,
  ): number {
    if (siteIndices.length === 0) return 0;

    let cost = distanceMatrix[0][siteIndices[0]];
    for (let k = 0; k < siteIndices.length - 1; k++) {
      cost += distanceMatrix[siteIndices[k]][siteIndices[k + 1]];
    }
    cost += distanceMatrix[siteIndices[siteIndices.length - 1]][0];

    if (criterion === 'time') {
      return cost;
    }
    if (criterion === 'cost' || criterion === 'balanced') {
      return cost;
    }
    return cost;
  }

  private compareByCriterion(
    a: number,
    b: number,
    criterion: OptimizationCriterion,
  ): number {
    if (criterion === 'distance' || criterion === 'time' || criterion === 'cost' || criterion === 'balanced') {
      return a - b;
    }
    return a - b;
  }

  private buildVehicleRoute(
    route: InternalRoute,
    depot: Depot,
    sites: CollectionSite[],
    distanceMatrix: number[][],
    config: RoutePlannerConfig,
  ): VehicleRoute {
    const { vehicle, siteIndices } = route;
    const stops: RouteStop[] = [];
    const path: { lat: number; lng: number }[] = [
      { lat: depot.lat, lng: depot.lng },
    ];

    let cumulativeLoad = 0;
    let totalDistance = 0;
    let totalTravelTime = 0;
    let totalServiceTime = 0;
    let currentTime = 0;
    let prevIndex = 0;

    for (const siteIndex of siteIndices) {
      const site = sites[siteIndex - 1];
      const dist = distanceMatrix[prevIndex][siteIndex];
      const travelMin = travelTimeMinutes(dist, vehicle.speedKmh);

      currentTime += travelMin;
      totalDistance += dist;
      totalTravelTime += travelMin;

      cumulativeLoad += site.demandKg;
      totalServiceTime += config.serviceTimeMinutes;

      stops.push({
        siteId: site.id,
        siteName: site.name,
        lat: site.lat,
        lng: site.lng,
        demandKg: site.demandKg,
        cumulativeLoadKg: cumulativeLoad,
        distanceFromPreviousKm: Math.round(dist * 1000) / 1000,
        travelTimeMinutes: Math.round(travelMin * 100) / 100,
        serviceTimeMinutes: config.serviceTimeMinutes,
        arrivalTimeMinutes: Math.round(currentTime * 100) / 100,
      });

      path.push({ lat: site.lat, lng: site.lng });
      currentTime += config.serviceTimeMinutes;
      prevIndex = siteIndex;
    }

    const returnDist = distanceMatrix[prevIndex][0];
    const returnTime = travelTimeMinutes(returnDist, vehicle.speedKmh);
    totalDistance += returnDist;
    totalTravelTime += returnTime;
    currentTime += returnTime;

    path.push({ lat: depot.lat, lng: depot.lng });

    const totalDuration = totalTravelTime + totalServiceTime;
    const totalCost = calculateRouteCost(
      totalDistance,
      totalDuration,
      config.costPerKm,
      config.costPerHour,
    );

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleCapacityKg: vehicle.capacityKg,
      stops,
      totalDistanceKm: Math.round(totalDistance * 1000) / 1000,
      totalTravelTimeMinutes: Math.round(totalTravelTime * 100) / 100,
      totalServiceTimeMinutes: totalServiceTime,
      totalDurationMinutes: Math.round(totalDuration * 100) / 100,
      totalLoadKg: cumulativeLoad,
      totalCost,
      path,
    };
  }

  private buildSummary(
    routes: VehicleRoute[],
    unassignedSites: CollectionSite[],
    totalSites: number,
  ): RoutePlanSummary {
    const activeRoutes = routes.filter((r) => r.stops.length > 0);
    const totalDistance = activeRoutes.reduce((s, r) => s + r.totalDistanceKm, 0);
    const totalDuration = activeRoutes.reduce((s, r) => s + r.totalDurationMinutes, 0);
    const totalCost = activeRoutes.reduce((s, r) => s + r.totalCost, 0);
    const totalCollected = activeRoutes.reduce((s, r) => s + r.totalLoadKg, 0);
    const totalUnassigned = unassignedSites.reduce((s, site) => s + site.demandKg, 0);
    const assignedCount = activeRoutes.reduce((s, r) => s + r.stops.length, 0);

    const utilizations = activeRoutes.map(
      (r) => (r.totalLoadKg / r.vehicleCapacityKg) * 100,
    );
    const avgUtilization =
      utilizations.length > 0
        ? utilizations.reduce((a, b) => a + b, 0) / utilizations.length
        : 0;

    return {
      totalVehiclesUsed: activeRoutes.length,
      totalSitesAssigned: assignedCount,
      totalSitesUnassigned: totalSites - assignedCount,
      totalDistanceKm: Math.round(totalDistance * 1000) / 1000,
      totalDurationMinutes: Math.round(totalDuration * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalWasteCollectedKg: totalCollected,
      totalWasteUnassignedKg: totalUnassigned,
      averageVehicleUtilization: Math.round(avgUtilization * 100) / 100,
    };
  }
}
