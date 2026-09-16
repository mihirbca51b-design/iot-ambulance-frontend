"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import DashboardLoading from "@/components/DashboardLoading";
import HistoryPanel from "@/components/HistoryPanel";
import {
  IconAlert,
  IconAmbulance,
  IconApi,
  IconBell,
  IconChevronDown,
  IconChip,
  IconClock,
  IconCommand,
  IconDiagnostics,
  IconGps,
  IconHospital,
  IconPeople,
  IconSettings,
  IconSignal,
  IconSpeed,
  IconTarget,
  IconTraffic,
} from "@/components/Icons";
import { useAmbulances } from "@/hooks/useAmbulances";
import type { AmbulanceReading } from "@/types";

const AmbulanceMap = dynamic(() => import("@/components/AmbulanceMap"), {
  ssr: false,
  loading: () => (
    <div className="map-area map-area-loading">
      <span className="loading-spinner loading-spinner-lg" />
      <p>Loading map…</p>
    </div>
  ),
});

type View = "command" | "traffic" | "hospital" | "diagnostics" | "settings";

const navItems: { id: View; label: string; shortLabel: string; icon: ReactNode }[] = [
  { id: "command", label: "Command center", shortLabel: "Command", icon: <IconCommand /> },
  { id: "traffic", label: "Traffic control", shortLabel: "Traffic", icon: <IconTraffic /> },
  { id: "hospital", label: "Hospital view", shortLabel: "Hospital", icon: <IconHospital /> },
  { id: "diagnostics", label: "Diagnostics", shortLabel: "Devices", icon: <IconDiagnostics /> },
  { id: "settings", label: "Settings", shortLabel: "Settings", icon: <IconSettings /> },
];

function relativeTime(createdAt: string, now: number | null) {
  if (!now) return "updating…";
  const seconds = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
  if (seconds < 8) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function Metric({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  detail: string;
  icon: ReactNode;
  tone?: "default" | "emergency";
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone === "emergency" ? "emergency-tone" : ""}`}>{icon}</div>
      <div>
        <p className="eyebrow">{label}</p>
        <p className="metric-value">{value}</p>
        <p className="metric-detail">{detail}</p>
      </div>
    </article>
  );
}

function LocalClock() {
  const [time, setTime] = useState("—");
  useEffect(() => {
    const update = () =>
      setTime(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return <time>{time}</time>;
}

export default function Home() {
  const { ambulances, connectionStatus, isLoading } = useAmbulances();
  const [view, setView] = useState<View>("command");
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string | null>(null);
  const [historyAmbulance, setHistoryAmbulance] = useState<AmbulanceReading | null>(null);
  const [isUnitMenuOpen, setIsUnitMenuOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [follow, setFollow] = useState(true);
  const [priorityRequested, setPriorityRequested] = useState(false);
  const [hospitalReady, setHospitalReady] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSelectedAmbulanceId((current) =>
      current && ambulances.some((a) => a.ambulance_id === current)
        ? current
        : ambulances[0]?.ambulance_id ?? null,
    );
  }, [ambulances]);

  const unit = ambulances.find((a) => a.ambulance_id === selectedAmbulanceId) ?? null;
  const online = connectionStatus === "connected";
  const networkLabel = isLoading ? "loading" : online ? "online" : "offline";
  const emergency = unit?.status.toLowerCase() === "emergency";
  const lastPacket = unit ? relativeTime(unit.created_at, now) : "waiting";
  const activeName = navItems.find((item) => item.id === view)?.label ?? "Command center";
  const emergencyCount = ambulances.filter((a) => a.status.toLowerCase() === "emergency").length;

  const selectAmbulance = (ambulanceId: string) => {
    setSelectedAmbulanceId(ambulanceId);
    setIsUnitMenuOpen(false);
  };

  const unitSelector = (
    <div className="unit-selector">
      <button
        type="button"
        className="unit-selector-button"
        onClick={() => setIsUnitMenuOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isUnitMenuOpen}
        disabled={!ambulances.length}
      >
        {unit?.ambulance_id ?? "Select unit"}
        <IconChevronDown className="h-4 w-4 opacity-60" />
      </button>
      {isUnitMenuOpen && (
        <div className="unit-selector-menu" role="listbox" aria-label="Select ambulance">
          {ambulances.map((ambulance) => (
            <button
              type="button"
              role="option"
              aria-selected={ambulance.ambulance_id === selectedAmbulanceId}
              key={ambulance.ambulance_id}
              className={`unit-selector-option ${ambulance.ambulance_id === selectedAmbulanceId ? "active" : ""}`}
              onClick={() => selectAmbulance(ambulance.ambulance_id)}
            >
              <span>
                <strong>{ambulance.ambulance_id}</strong>
                <small>
                  {ambulance.people} {ambulance.people === 1 ? "person" : "people"}
                </small>
              </span>
              <em
                className={
                  ambulance.status.toLowerCase() === "emergency" ? "status-emergency" : "status-normal"
                }
              >
                {ambulance.status}
              </em>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const statsRow = (
    <section className="stats-row">
      <article className="stat-pill accent-blue">
        <p className="stat-pill-label">Active units</p>
        <p className="stat-pill-value">{ambulances.length}</p>
        <p className="stat-pill-detail">Fleet on network</p>
      </article>
      <article className={`stat-pill ${emergencyCount > 0 ? "accent-red" : ""}`}>
        <p className="stat-pill-label">Emergencies</p>
        <p className="stat-pill-value">{emergencyCount}</p>
        <p className="stat-pill-detail">{emergencyCount > 0 ? "Requires attention" : "All clear"}</p>
      </article>
      <article className="stat-pill accent-green">
        <p className="stat-pill-label">Connection</p>
        <p className="stat-pill-value" style={{ fontSize: "18px", marginTop: "10px" }}>
          {isLoading ? "Loading…" : online ? "Live" : "Offline"}
        </p>
        <p className="stat-pill-detail">WebSocket stream</p>
      </article>
      <article className="stat-pill">
        <p className="stat-pill-label">Last update</p>
        <p className="stat-pill-value" style={{ fontSize: "18px", marginTop: "10px" }}>
          {lastPacket}
        </p>
        <p className="stat-pill-detail">Selected unit</p>
      </article>
    </section>
  );

  const emptyState = (
    <section className="empty-state">
      <div className="empty-icon">
        <IconAmbulance className="h-7 w-7" />
      </div>
      <h3>No ambulances connected</h3>
      <p>Start your ESP32 device to see live telemetry appear on the map.</p>
    </section>
  );

  const commandCenter = (
    <>
      {statsRow}
      <section className="status-strip">
        <div className="unit-status">
          <p className="eyebrow">Unit status</p>
          {unitSelector}
        </div>
        {unit && (
          <span className={`emergency-badge ${emergency ? "is-emergency" : "is-normal"}`}>
            <i className="status-dot" />
            {emergency ? "Emergency" : unit.status}
          </span>
        )}
        <span className="packet">Last packet: {lastPacket}</span>
        <span className="demo-badge">{demoMode ? "Demo mode" : "Live mode"}</span>
      </section>

      {ambulances.length === 0 ? (
        emptyState
      ) : (
        <>
          <section className="main-grid">
            <article className="map-card">
              <div className="card-head">
                <div>
                  <h2>Live location</h2>
                  <p>OpenStreetMap · Real-time GPS tracking</p>
                </div>
                <span className="live"><i />Live</span>
              </div>
              <div className="map-area">
                <AmbulanceMap
                  ambulances={ambulances}
                  selectedAmbulanceId={selectedAmbulanceId}
                  focusVersion={0}
                  onAmbulanceSelect={selectAmbulance}
                />
              </div>
              <div className="map-controls">
                <span>Tracking {ambulances.length} unit{ambulances.length !== 1 ? "s" : ""}</span>
                <button type="button" className="follow" onClick={() => setFollow(!follow)}>
                  {follow ? "Following unit" : "Follow unit"}
                </button>
              </div>
            </article>

            <section className="details">
              <button type="button" className="unit-card" onClick={() => unit && setHistoryAmbulance(unit)}>
                <div className="metric-icon">
                  <IconAmbulance className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Ambulance ID</p>
                  <p className="unit-id">{unit?.ambulance_id ?? "—"}</p>
                  <span>{unit ? "View route history →" : "Telemetry will appear here"}</span>
                </div>
              </button>
              <Metric
                icon={<IconPeople className="h-5 w-5" />}
                label="People inside"
                value={unit?.people ?? "—"}
                detail="Live occupancy sensor"
              />
              <Metric
                icon={<IconGps className="h-5 w-5" />}
                label="GPS coordinates"
                value={unit ? `${unit.latitude.toFixed(5)}, ${unit.longitude.toFixed(5)}` : "—"}
                detail="Latitude · longitude"
              />
              <Metric
                icon={<IconSpeed className="h-5 w-5" />}
                label="Speed"
                value="— km/h"
                detail="Not reported by device"
              />
              <Metric
                icon={<IconClock className="h-5 w-5" />}
                label="Last update"
                value={lastPacket}
                detail={unit && now ? new Date(unit.created_at).toLocaleTimeString() : "Awaiting telemetry"}
                tone={emergency ? "emergency" : "default"}
              />
              <div className="mini">
                <Metric
                  icon={<IconSignal className="h-5 w-5" />}
                  label="Signal"
                  value={online ? "Good" : "—"}
                  detail={online ? "Live connection" : "Reconnecting"}
                />
              </div>
            </section>
          </section>

          <section className="bottom">
            <Metric
              icon={<IconChip className="h-5 w-5" />}
              label="Device"
              value="ESP32"
              detail={online ? "Online · Wi-Fi" : "Offline · Wi-Fi"}
            />
            <Metric icon={<IconTarget className="h-5 w-5" />} label="Accuracy" value="— m" detail="GPS precision unavailable" />
            <Metric
              icon={<IconApi className="h-5 w-5" />}
              label="API channel"
              value={online ? "Connected" : "Connecting"}
              detail={online ? "Authenticated · live stream" : "Checking connection"}
            />
          </section>
        </>
      )}
    </>
  );

  const traffic = (
    <section className="panel-grid">
      <article className="wide-panel">
        <p className="eyebrow">Traffic control</p>
        <h2>Priority corridor</h2>
        <p className="panel-copy">
          Coordinate a clear route for the selected emergency vehicle. Traffic-light integration is simulated in demo mode.
        </p>
        <div className="control-row">
          <button type="button" className="primary-button" onClick={() => setPriorityRequested(!priorityRequested)}>
            {priorityRequested ? "Priority requested" : "Request signal priority"}
          </button>
          <span className={priorityRequested ? "success-text" : "muted-text"}>
            {priorityRequested ? "Corridor request queued" : "No active corridor request"}
          </span>
        </div>
      </article>
      <Metric
        icon={<IconTraffic className="h-5 w-5" />}
        label="Selected route"
        value={unit ? "GPS active" : "Waiting"}
        detail={unit ? `Tracking ${unit.ambulance_id}` : "No route available yet"}
      />
      <Metric icon={<IconAlert className="h-5 w-5" />} label="Road alerts" value="0" detail="No reported obstructions" />
    </section>
  );

  const hospital = (
    <section className="panel-grid">
      <article className="wide-panel">
        <p className="eyebrow">Hospital view</p>
        <h2>Incoming patient readiness</h2>
        <p className="panel-copy">
          Share the selected unit status with the receiving hospital and prepare the emergency team.
        </p>
        <div className="control-row">
          <button type="button" className="primary-button" onClick={() => setHospitalReady(!hospitalReady)}>
            {hospitalReady ? "Hospital marked ready" : "Mark receiving team ready"}
          </button>
          <span className={hospitalReady ? "success-text" : "muted-text"}>
            {hospitalReady ? "Receiving team notified" : "Waiting for hospital confirmation"}
          </span>
        </div>
      </article>
      <Metric
        icon={<IconAmbulance className="h-5 w-5" />}
        label="Incoming unit"
        value={unit?.ambulance_id ?? "—"}
        detail={emergency ? "Emergency triage" : "Unit status pending"}
        tone={emergency ? "emergency" : "default"}
      />
      <Metric
        icon={<IconPeople className="h-5 w-5" />}
        label="Occupancy"
        value={unit?.people ?? "—"}
        detail="Reported people inside"
      />
    </section>
  );

  const diagnostics = (
    <section className="panel-grid">
      <Metric
        icon={<IconChip className="h-5 w-5" />}
        label="Controller"
        value="ESP32"
        detail={online ? "Online · Wi-Fi connected" : "Connection unavailable"}
      />
      <Metric
        icon={<IconGps className="h-5 w-5" />}
        label="GPS"
        value={unit ? "Receiving" : "Waiting"}
        detail={unit ? `Coordinates from ${unit.ambulance_id}` : "No GPS packet yet"}
      />
      <Metric
        icon={<IconSignal className="h-5 w-5" />}
        label="Network"
        value={online ? "Connected" : "Disconnected"}
        detail={online ? "WebSocket live stream" : "Automatic retry enabled"}
      />
      <Metric
        icon={<IconClock className="h-5 w-5" />}
        label="Last packet"
        value={lastPacket}
        detail="Selected ambulance telemetry"
      />
    </section>
  );

  const settings = (
    <section className="settings-panel">
      <p className="eyebrow">Settings</p>
      <h2>Dashboard preferences</h2>
      <label className="setting-row">
        <span>
          <strong>Demo mode</strong>
          <small>Show demo labels for simulated controls.</small>
        </span>
        <button
          type="button"
          className={`toggle ${demoMode ? "on" : ""}`}
          onClick={() => setDemoMode(!demoMode)}
          aria-pressed={demoMode}
        >
          <i />
        </button>
      </label>
      <label className="setting-row">
        <span>
          <strong>Live location follow</strong>
          <small>Keep the map centered on selected unit positions.</small>
        </span>
        <button
          type="button"
          className={`toggle ${follow ? "on" : ""}`}
          onClick={() => setFollow(!follow)}
          aria-pressed={follow}
        >
          <i />
        </button>
      </label>
      <p className="settings-note">
        Connection URLs and data collection are configured in the project environment file.
      </p>
    </section>
  );

  const viewContent: Record<View, ReactNode> = {
    command: commandCenter,
    traffic,
    hospital,
    diagnostics,
    settings,
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <IconAmbulance className="h-6 w-6" />
          </div>
          <div>
            <strong>Smart Ambulance</strong>
            <span>IoT Monitoring</span>
          </div>
        </div>
        <p className="nav-label">Operations</p>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => setView(item.id)}
            >
              <span className="nav-symbol">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <i className={`dot ${isLoading ? "loading" : online ? "" : "offline"}`} />
          System {isLoading ? "loading data" : online ? "operational" : "reconnecting"}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="breadcrumb">{activeName}</p>
            <h1>{view === "command" ? "Live emergency overview" : activeName}</h1>
          </div>
          <div className="top-actions">
            <span
              className={`network ${isLoading ? "network-loading" : online ? "" : "network-offline"}`}
            >
              <i />
              Network {networkLabel}
            </span>
            <LocalClock />
            <button type="button" className="icon-button" aria-label="Notifications">
              <IconBell className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        <div className="content">
          {isLoading ? <DashboardLoading /> : viewContent[view]}
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-symbol">{item.icon}</span>
            {item.shortLabel}
          </button>
        ))}
      </nav>

      {historyAmbulance && (
        <HistoryPanel ambulance={historyAmbulance} onClose={() => setHistoryAmbulance(null)} />
      )}
    </main>
  );
}
