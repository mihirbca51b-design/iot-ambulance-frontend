"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";

import type { AmbulanceReading } from "@/types";

interface AmbulanceMapProps {
  ambulances: AmbulanceReading[];
  selectedAmbulanceId: string | null;
  focusVersion: number;
  onAmbulanceSelect: (ambulanceId: string) => void;
}

function UpdateMapView({ ambulances, selectedAmbulanceId, focusVersion }: Omit<AmbulanceMapProps, "onAmbulanceSelect">) {
  const map = useMap();
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const selected = ambulances.find((ambulance) => ambulance.ambulance_id === selectedAmbulanceId);
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 15, { duration: 0.6 });
      return;
    }

    const hasNewAmbulance = ambulances.some(
      (ambulance) => !seenIds.current.has(ambulance.ambulance_id),
    );

    ambulances.forEach((ambulance) => seenIds.current.add(ambulance.ambulance_id));

    if ((hasNewAmbulance || focusVersion > 0) && ambulances.length > 0) {
      const bounds: LatLngBoundsExpression = ambulances.map((ambulance) => [
        ambulance.latitude,
        ambulance.longitude,
      ]);
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [ambulances, focusVersion, map, selectedAmbulanceId]);

  return null;
}

function markerIcon(status: string, isSelected: boolean) {
  const isEmergency = status.toLowerCase() === "emergency";
  const color = isEmergency ? "#ef4444" : "#3b82f6";
  const size = isSelected ? 36 : 24;
  const ring = isSelected
    ? `0 0 0 4px ${isEmergency ? "rgba(239,68,68,.25)" : "rgba(59,130,246,.25)"}`
    : "none";
  // A divIcon avoids Leaflet's default PNG path issue with Next.js/Webpack.
  return L.divIcon({
    className: "ambulance-marker",
    html: `<span style="display:block;width:${size}px;height:${size}px;border:3px solid white;border-radius:50%;background:${color};box-shadow:0 4px 12px rgba(15,23,42,.3),${ring}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -12],
  });
}

export default function AmbulanceMap({ ambulances, selectedAmbulanceId, focusVersion, onAmbulanceSelect }: AmbulanceMapProps) {
  const defaultCenter: [number, number] = [20, 0];

  return (
    <MapContainer center={defaultCenter} zoom={2} scrollWheelZoom className="h-full min-h-[420px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UpdateMapView ambulances={ambulances} selectedAmbulanceId={selectedAmbulanceId} focusVersion={focusVersion} />
      {ambulances.map((ambulance) => (
        <Marker
          key={ambulance.ambulance_id}
          position={[ambulance.latitude, ambulance.longitude]}
          icon={markerIcon(ambulance.status, ambulance.ambulance_id === selectedAmbulanceId)}
          eventHandlers={{ click: () => onAmbulanceSelect(ambulance.ambulance_id) }}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -12]}
            opacity={1}
            className="ambulance-label"
          >
            {ambulance.ambulance_id}
          </Tooltip>
          <Popup>
            <strong>{ambulance.ambulance_id}</strong>
            <br />
            People: {ambulance.people}
            <br />
            Status: {ambulance.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
