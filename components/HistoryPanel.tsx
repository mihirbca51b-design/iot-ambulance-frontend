"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { AmbulanceReading } from "@/types";

const HistoryRouteMap = dynamic(() => import("@/components/HistoryRouteMap"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-xl bg-slate-100" />,
});

interface HistoryPanelProps {
  ambulance: AmbulanceReading;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HistoryPanel({ ambulance, onClose }: HistoryPanelProps) {
  const [readings, setReadings] = useState<AmbulanceReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
        const response = await fetch(
          `${API_URL}/api/ambulance/${encodeURIComponent(ambulance.ambulance_id)}/history?limit=20`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("History could not be loaded.");
        const history: AmbulanceReading[] = await response.json();
        setReadings(history);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError("History is temporarily unavailable.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadHistory();
    return () => controller.abort();
  }, [ambulance.ambulance_id]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      onClick={onClose}
    >
      <section
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Recent activity</p>
            <h2 id="history-title" className="mt-1 text-xl font-bold text-ink">
              🚑 {ambulance.ambulance_id} history
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-ink"
            aria-label="Close history"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading history...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : readings.length < 2 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-ink">No history yet</p>
            <p className="mt-1 text-sm text-slate-500">At least two readings are needed to show a route.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">People</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td className="px-4 py-3 text-slate-600">{new Date(reading.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-ink">{reading.people}</td>
                      <td className="px-4 py-3 text-slate-600">{reading.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <HistoryRouteMap readings={readings} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
