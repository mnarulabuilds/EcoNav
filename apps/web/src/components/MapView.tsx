'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { CollectionSite, Depot, VehicleRoute } from '@econav/core';
import { ROUTE_COLORS } from '@/lib/defaults';

import 'leaflet/dist/leaflet.css';

const depotIcon = new L.DivIcon({
  className: 'depot-marker',
  html: `<div style="background:#0f766e;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🏭</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const siteIcon = new L.DivIcon({
  className: 'site-marker',
  html: `<div style="background:#dc2626;width:22px;height:22px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

type MapMode = 'depot' | 'site' | 'view';

interface MapViewProps {
  depot: Depot;
  sites: CollectionSite[];
  routes: VehicleRoute[];
  mode: MapMode;
  simulationPosition?: { lat: number; lng: number; vehicleName: string } | null;
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({
  mode,
  onMapClick,
}: {
  mode: MapMode;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (mode !== 'view' && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapView({
  depot,
  sites,
  routes,
  mode,
  simulationPosition,
  onMapClick,
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey] = useState(() => `map-${Math.random().toString(36).slice(2)}`);

  const center = useMemo(
    () => [depot.lat, depot.lng] as [number, number],
    [depot.lat, depot.lng],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, [isMounted]);

  if (!isMounted) {
    return <div className="map-loading" aria-hidden="true" />;
  }

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={
          process.env.NEXT_PUBLIC_MAP_TILE_URL ??
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      />

      <MapClickHandler mode={mode} onMapClick={onMapClick} />

      <Marker position={[depot.lat, depot.lng]} icon={depotIcon}>
        <Popup>
          <strong>{depot.name}</strong>
          <br />
          Depot (Start/End)
        </Popup>
      </Marker>

      {sites.map((site) => (
        <Marker key={site.id} position={[site.lat, site.lng]} icon={siteIcon}>
          <Popup>
            <strong>{site.name}</strong>
            <br />
            Demand: {site.demandKg} kg
          </Popup>
        </Marker>
      ))}

      {routes.map((route, idx) => (
        route.path.length > 1 && (
          <Polyline
            key={route.vehicleId}
            positions={route.path.map((p) => [p.lat, p.lng] as [number, number])}
            color={ROUTE_COLORS[idx % ROUTE_COLORS.length]}
            weight={4}
            opacity={0.8}
          />
        )
      ))}

      {simulationPosition && (
        <CircleMarker
          center={[simulationPosition.lat, simulationPosition.lng]}
          radius={12}
          pathOptions={{
            color: '#fff',
            fillColor: '#14b8a6',
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>{simulationPosition.vehicleName}</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
