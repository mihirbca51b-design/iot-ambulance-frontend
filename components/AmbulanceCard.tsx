import { useEffect, useState } from "react";

import type { AmbulanceReading } from "@/types";

interface AmbulanceCardProps {
  ambulance: AmbulanceReading;
  onClick: () => void;
}

function formatRelativeTime(createdAt: string, now: number): string {
  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  return `${Math.floor(elapsedMinutes / 60)}h ago`;
}

export default function AmbulanceCard({ ambulance, onClick }: AmbulanceCardProps) {
  const [now, setNow] = useState(() => Date.now());
  const ageInSeconds = Math.max(0, (now - new Date(ambulance.created_at).getTime()) / 1000);
  const isConnectionLost = ageInSeconds > 10;
  const isEmergency = ambulance.status.toLowerCase() === "emergency";

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <article
      className="cursor-pointer rounded-2xl bg-white p-5 shadow-panel transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-coral/50"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Unit</p>
          <h2 className="mt-1 text-lg font-bold text-ink">🚑 AMBULANCE #{ambulance.ambulance_id}</h2>
        </div>
        {isConnectionLost ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Connection lost
          </span>
        ) : isEmergency ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            EMERGENCY
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            NORMAL
          </span>
        )}
      </div>
      <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm text-slate-500">People inside</p>
          <p className="mt-1 text-3xl font-bold text-ink">{ambulance.people}</p>
        </div>
        <p className="text-sm text-slate-400">{formatRelativeTime(ambulance.created_at, now)}</p>
      </div>
    </article>
  );
}
