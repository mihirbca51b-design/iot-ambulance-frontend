"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-screen">
      <section>
        <p className="eyebrow">Dashboard unavailable</p>
        <h1>Something interrupted the command center.</h1>
        <p>Please retry the dashboard. Live telemetry will reconnect automatically.</p>
        <button type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
