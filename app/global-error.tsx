"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="error-screen">
          <section>
            <h1>Smart Ambulance is temporarily unavailable.</h1>
            <button type="button" onClick={reset}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
