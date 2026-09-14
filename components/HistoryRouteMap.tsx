"use client";

import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

import type { AmbulanceReading } from "@/types";

interface HistoryRouteMapProps {
  readings: AmbulanceReading[];
}

function FitRoute({ points }: { points: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points as LatLngBoundsExpression, { padding: [20, 20] });
    }
  }, [map, points]);

  return null;
}

export default function HistoryRouteMap({ readings }: HistoryRouteMapProps) {
  const points: LatLngExpression[] = readings
    .slice()
    .reverse()
    .map((reading) => [reading.latitude, reading.longitude]);

  return (
    <MapContainer className="h-48 w-full" center={points[0] ?? [20, 0]} zoom={12} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={points} pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.85 }} />
      <FitRoute points={points} />
    </MapContainer>
  );
}
