export default function DashboardLoading() {
  return (
    <div className="dashboard-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-banner">
        <span className="loading-spinner" aria-hidden="true" />
        <div>
          <p className="loading-title">Loading ambulance data</p>
          <p className="loading-subtitle">Fetching live telemetry and connecting to the server…</p>
        </div>
      </div>

      <section className="status-strip loading-skeleton" aria-hidden="true">
        <div className="skeleton-block skeleton-sm" />
        <div className="skeleton-block skeleton-md" />
        <div className="skeleton-block skeleton-lg" />
      </section>

      <section className="main-grid">
        <article className="map-card">
          <div className="card-head">
            <div className="skeleton-stack">
              <div className="skeleton-block skeleton-md" />
              <div className="skeleton-block skeleton-sm" />
            </div>
          </div>
          <div className="map-area map-area-loading">
            <span className="loading-spinner loading-spinner-lg" />
            <p>Preparing live map…</p>
          </div>
        </article>

        <section className="details">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="metric-card loading-metric">
              <div className="skeleton-block skeleton-icon" />
              <div className="skeleton-stack skeleton-stack-wide">
                <div className="skeleton-block skeleton-xs" />
                <div className="skeleton-block skeleton-md" />
                <div className="skeleton-block skeleton-sm" />
              </div>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
