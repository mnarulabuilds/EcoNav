'use client';

import { useEffect, useId, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const issueIcon = new L.DivIcon({
  className: 'issue-marker',
  html: `<div style="background:#dc2626;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);" aria-hidden="true"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface IssueLocationMapProps {
  center: { lat: number; lng: number };
  position: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}

function PickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function IssueLocationMap({ center, position, onPick }: IssueLocationMapProps) {
  const [mounted, setMounted] = useState(false);
  const instructionsId = useId();
  const statusId = useId();

  useEffect(() => {
    setMounted(true);
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) {
    return (
      <div className="issue-map issue-map-loading" role="status" aria-live="polite">
        Loading map…
      </div>
    );
  }

  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const positionText = position
    ? `Issue pinned at latitude ${position.lat.toFixed(5)}, longitude ${position.lng.toFixed(5)}`
    : 'No location selected yet. Click the map to place a pin.';

  return (
    <section className="issue-map-section" aria-labelledby={instructionsId}>
      <p id={instructionsId} className="sr-only">
        Interactive map. Click or tap on the map to set the issue location. You can zoom with
        scroll or pinch gestures.
      </p>
      <p id={statusId} className="sr-only" aria-live="polite">
        {positionText}
      </p>
      <div className="issue-map" role="group" aria-describedby={`${instructionsId} ${statusId}`}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          aria-label="Issue location map"
        >
          <TileLayer attribution="&copy; OpenStreetMap contributors" url={tileUrl} />
          <PickHandler onPick={onPick} />
          {position && <Marker position={[position.lat, position.lng]} icon={issueIcon} />}
        </MapContainer>
      </div>
    </section>
  );
}
