'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import type {
  CollectionSite,
  Depot,
  OptimizationCriterion,
  RoutePlanResult,
  SimulationEvent,
  Vehicle,
  VehicleRoute,
} from '@econav/core';
import { planRoutes } from '@/lib/api';
import {
  DEFAULT_DEPOT,
  DEFAULT_SITES,
  DEFAULT_VEHICLES,
} from '@/lib/defaults';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

type MapMode = 'depot' | 'site' | 'view';
type AppTab = 'setup' | 'results' | 'simulation';

let idCounter = 100;

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export default function PlannerApp() {
  const [depot, setDepot] = useState<Depot>(DEFAULT_DEPOT);
  const [sites, setSites] = useState<CollectionSite[]>(DEFAULT_SITES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [criterion, setCriterion] = useState<OptimizationCriterion>('balanced');
  const [serviceTime, setServiceTime] = useState(10);
  const [mapMode, setMapMode] = useState<MapMode>('view');
  const [activeTab, setActiveTab] = useState<AppTab>('setup');
  const [planResult, setPlanResult] = useState<RoutePlanResult | null>(null);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);
  const [simIndex, setSimIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDemand, setNewSiteDemand] = useState(500);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState(2000);
  const [newVehicleSpeed, setNewVehicleSpeed] = useState(40);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (mapMode === 'depot') {
        setDepot((d) => ({ ...d, lat, lng }));
        setMapMode('view');
      } else if (mapMode === 'site') {
        const name = newSiteName.trim() || `Site ${sites.length + 1}`;
        setSites((prev) => [
          ...prev,
          {
            id: nextId('site'),
            name,
            lat,
            lng,
            demandKg: newSiteDemand,
          },
        ]);
        setNewSiteName('');
        setMapMode('view');
      }
    },
    [mapMode, newSiteName, newSiteDemand, sites.length],
  );

  const handlePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await planRoutes({
        depot,
        sites,
        vehicles,
        config: {
          criterion,
          serviceTimeMinutes: serviceTime,
          costPerKm: 2.5,
          costPerHour: 500,
        },
      });
      setPlanResult(response.plan);
      setSimulationEvents(response.simulation.events);
      setSimIndex(0);
      setIsSimulating(false);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Planning failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSimulating || simulationEvents.length === 0) return;

    const interval = setInterval(() => {
      setSimIndex((prev) => {
        if (prev >= simulationEvents.length - 1) {
          setIsSimulating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isSimulating, simulationEvents.length]);

  const currentSimEvent = simulationEvents[simIndex] ?? null;
  const routes: VehicleRoute[] = planResult?.routes ?? [];

  const totalDemand = sites.reduce((s, site) => s + site.demandKg, 0);
  const totalCapacity = vehicles.reduce((s, v) => s + v.capacityKg, 0);

  return (
    <>
      <header className="app-header">
        <div>
          <h1>EcoNav</h1>
          <p>Smart City Waste Disposal Route Planner</p>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="mode-tabs">
            {(['setup', 'results', 'simulation'] as AppTab[]).map((tab) => (
              <button
                key={tab}
                className={`mode-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'setup' ? 'Setup' : tab === 'results' ? 'Results' : 'Simulate'}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {totalDemand > totalCapacity && activeTab === 'setup' && (
            <div className="alert alert-warning">
              Total demand ({totalDemand} kg) exceeds fleet capacity ({totalCapacity} kg).
              Some sites may remain unassigned.
            </div>
          )}

          {activeTab === 'setup' && (
            <>
              <div className="panel">
                <h2>Map Placement</h2>
                <div className="mode-tabs">
                  <button
                    className={`mode-tab ${mapMode === 'view' ? 'active' : ''}`}
                    onClick={() => setMapMode('view')}
                  >
                    View
                  </button>
                  <button
                    className={`mode-tab ${mapMode === 'depot' ? 'active' : ''}`}
                    onClick={() => setMapMode('depot')}
                  >
                    Set Depot
                  </button>
                  <button
                    className={`mode-tab ${mapMode === 'site' ? 'active' : ''}`}
                    onClick={() => setMapMode('site')}
                  >
                    Add Site
                  </button>
                </div>
                {mapMode === 'site' && (
                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <div className="form-group">
                      <label>Site Name</label>
                      <input
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                        placeholder="Collection site"
                      />
                    </div>
                    <div className="form-group">
                      <label>Demand (kg)</label>
                      <input
                        type="number"
                        min={1}
                        value={newSiteDemand}
                        onChange={(e) => setNewSiteDemand(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0' }}>
                  {mapMode === 'depot' && 'Click on the map to reposition the depot.'}
                  {mapMode === 'site' && 'Click on the map to add a collection site.'}
                  {mapMode === 'view' && 'Pan and zoom the map freely.'}
                </p>
              </div>

              <div className="panel">
                <h2>Collection Sites ({sites.length})</h2>
                <ul className="item-list">
                  {sites.map((site) => (
                    <li key={site.id}>
                      <span>
                        {site.name} — {site.demandKg} kg
                      </span>
                      <button
                        className="btn btn-danger"
                        onClick={() => setSites((s) => s.filter((x) => x.id !== site.id))}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <h2>Vehicles ({vehicles.length})</h2>
                <ul className="item-list">
                  {vehicles.map((v) => (
                    <li key={v.id}>
                      <span>
                        {v.name} — {v.capacityKg} kg @ {v.speedKmh} km/h
                      </span>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          setVehicles((vs) => vs.filter((x) => x.id !== v.id))
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      value={newVehicleName}
                      onChange={(e) => setNewVehicleName(e.target.value)}
                      placeholder="Truck name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity (kg)</label>
                    <input
                      type="number"
                      min={1}
                      value={newVehicleCapacity}
                      onChange={(e) => setNewVehicleCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Speed (km/h)</label>
                  <input
                    type="number"
                    min={1}
                    value={newVehicleSpeed}
                    onChange={(e) => setNewVehicleSpeed(Number(e.target.value))}
                  />
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const name = newVehicleName.trim() || `Truck ${vehicles.length + 1}`;
                    setVehicles((prev) => [
                      ...prev,
                      {
                        id: nextId('vehicle'),
                        name,
                        capacityKg: newVehicleCapacity,
                        speedKmh: newVehicleSpeed,
                      },
                    ]);
                    setNewVehicleName('');
                  }}
                >
                  Add Vehicle
                </button>
              </div>

              <div className="panel">
                <h2>Optimization</h2>
                <div className="form-group">
                  <label>Criterion</label>
                  <select
                    value={criterion}
                    onChange={(e) =>
                      setCriterion(e.target.value as OptimizationCriterion)
                    }
                  >
                    <option value="balanced">Balanced (distance + cost)</option>
                    <option value="distance">Minimum Distance</option>
                    <option value="time">Minimum Time</option>
                    <option value="cost">Minimum Cost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Time per Site (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    value={serviceTime}
                    onChange={(e) => setServiceTime(Number(e.target.value))}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handlePlan}
                  disabled={loading || sites.length === 0 || vehicles.length === 0}
                >
                  {loading ? 'Planning...' : 'Plan Optimal Routes'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'results' && planResult && (
            <div className="panel">
              <h2>Plan Summary</h2>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="value">{planResult.summary.totalVehiclesUsed}</div>
                  <div className="label">Vehicles Used</div>
                </div>
                <div className="summary-card">
                  <div className="value">{planResult.summary.totalSitesAssigned}</div>
                  <div className="label">Sites Assigned</div>
                </div>
                <div className="summary-card">
                  <div className="value">{planResult.summary.totalDistanceKm}</div>
                  <div className="label">Total km</div>
                </div>
                <div className="summary-card">
                  <div className="value">
                    {Math.round(planResult.summary.totalDurationMinutes)} min
                  </div>
                  <div className="label">Duration</div>
                </div>
                <div className="summary-card">
                  <div className="value">₹{planResult.summary.totalCost}</div>
                  <div className="label">Est. Cost</div>
                </div>
                <div className="summary-card">
                  <div className="value">{planResult.summary.averageVehicleUtilization}%</div>
                  <div className="label">Utilization</div>
                </div>
              </div>

              {planResult.unassignedSites.length > 0 && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                  {planResult.unassignedSites.length} site(s) unassigned due to capacity limits.
                </div>
              )}

              <h3>Routes</h3>
              {routes
                .filter((r) => r.stops.length > 0)
                .map((route) => (
                  <div key={route.vehicleId} style={{ marginBottom: '0.75rem', fontSize: '0.8125rem' }}>
                    <strong>{route.vehicleName}</strong>
                    <br />
                    {route.stops.length} stops · {route.totalDistanceKm} km ·{' '}
                    {route.totalLoadKg}/{route.vehicleCapacityKg} kg
                    <br />
                    Stops: {route.stops.map((s) => s.siteName).join(' → ')}
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'results' && !planResult && (
            <div className="panel">
              <p>No plan yet. Configure sites and vehicles, then run the planner.</p>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="panel">
              <h2>Route Simulation</h2>
              {!planResult ? (
                <p>Generate a route plan first to run simulation.</p>
              ) : (
                <>
                  <div className="simulation-log">
                    {simulationEvents.slice(0, simIndex + 1).map((event, i) => (
                      <div key={i} className="event">
                        <span className="time">
                          [{event.timestampMinutes.toFixed(1)}m]
                        </span>
                        {event.message}
                      </div>
                    ))}
                  </div>
                  <div className="simulation-controls">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSimIndex(0);
                        setIsSimulating(true);
                        setActiveTab('simulation');
                      }}
                      disabled={isSimulating}
                    >
                      {isSimulating ? 'Running...' : 'Start Simulation'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSimIndex(0);
                        setIsSimulating(false);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                  {currentSimEvent && (
                    <p style={{ fontSize: '0.8125rem', marginTop: '0.75rem' }}>
                      Current: {currentSimEvent.vehicleName} — Load:{' '}
                      {currentSimEvent.loadKg} kg
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </aside>

        <main className="map-container">
          <MapView
            depot={depot}
            sites={sites}
            routes={routes}
            mode={mapMode}
            onMapClick={handleMapClick}
            simulationPosition={
              currentSimEvent
                ? {
                    lat: currentSimEvent.lat,
                    lng: currentSimEvent.lng,
                    vehicleName: currentSimEvent.vehicleName,
                  }
                : null
            }
          />
        </main>
      </div>
    </>
  );
}
