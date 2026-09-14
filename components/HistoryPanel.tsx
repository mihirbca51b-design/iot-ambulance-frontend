"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IconAmbulance, IconClose } from "@/components/Icons";
import type { AmbulanceReading } from "@/types";

const HistoryRouteMap = dynamic(() => import("@/components/HistoryRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="map-area-loading" style={{ height: "192px" }}>
      <span className="loading-spinner" />
      <p>Loading route…</p>
    </div>
  ),
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
      className="history-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      onClick={onClose}
    >
      <section className="history-panel" onClick={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div className="metric-icon">
              <IconAmbulance className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2 id="history-title" style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: 700 }}>
                {ambulance.ambulance_id} history
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="history-close" aria-label="Close history">
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <span className="loading-spinner" style={{ margin: "0 auto" }} />
            <p style={{ marginTop: "14px", color: "#64748b", fontSize: "14px" }}>Loading history…</p>
          </div>
        ) : error ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#dc2626", fontSize: "14px" }}>{error}</div>
        ) : readings.length < 2 ? (
          <div className="empty-state" style={{ marginTop: "24px", padding: "40px 24px" }}>
            <h3>No history yet</h3>
            <p>At least two readings are needed to show a route on the map.</p>
          </div>
        ) : (
          <div style={{ marginTop: "24px", display: "grid", gap: "18px" }}>
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>People</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td style={{ color: "#64748b" }}>{new Date(reading.created_at).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{reading.people}</td>
                      <td>
                        <span
                          className={
                            reading.status.toLowerCase() === "emergency" ? "status-emergency" : "status-normal"
                          }
                        >
                          {reading.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="history-table-wrap" style={{ overflow: "hidden" }}>
              <HistoryRouteMap readings={readings} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
