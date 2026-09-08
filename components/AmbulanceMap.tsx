"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";

import type { AmbulanceReading } from "@/types";

interface AmbulanceMapProps {
  ambulances: AmbulanceReading[];
}

function FitNewAmbulances({ ambulances }: AmbulanceMapProps) {
  const map = useMap();
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const hasNewAmbulance = ambulances.some(
      (ambulance) => !seenIds.current.has(ambulance.ambulance_id),
    );

    ambulances.forEach((ambulance) => seenIds.current.add(ambulance.ambulance_id));

    if (hasNewAmbulance && ambulances.length > 0) {
      const bounds: LatLngBoundsExpression = ambulances.map((ambulance) => [
        ambulance.latitude,
        ambulance.longitude,
      ]);
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [ambulances, map]);

  return null;
}

function markerIcon(status: string) {
  const color = status.toLowerCase() === "emergency" ? "#dc2626" : "#2563eb";
  // A divIcon avoids Leaflet's default PNG path issue with Next.js/Webpack.
  return L.divIcon({
    className: "ambulance-marker",
    html: `<span style="display:block;width:20px;height:20px;border:3px solid white;border-radius:50%;background:${color};box-shadow:0 2px 6px rgba(15,23,42,.35)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

export default function AmbulanceMap({ ambulances }: AmbulanceMapProps) {
  const defaultCenter: [number, number] = [20, 0];

  return (
    <MapContainer center={defaultCenter} zoom={2} scrollWheelZoom className="h-full min-h-[420px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitNewAmbulances ambulances={ambulances} />
      {ambulances.map((ambulance) => (
        <Marker
          key={ambulance.ambulance_id}
          position={[ambulance.latitude, ambulance.longitude]}
          icon={markerIcon(ambulance.status)}
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
