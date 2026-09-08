# Ambulance Monitoring Dashboard

Next.js App Router dashboard for live ambulance monitoring.

## Local development

```powershell
Copy-Item .env.local.example .env.local
npm.cmd install
npm.cmd run dev
```

The API and WebSocket URLs are configured through environment variables and
read in the application via `process.env.NEXT_PUBLIC_API_URL` and
`process.env.NEXT_PUBLIC_WS_URL`.

## Deploy to Vercel

1. Push the project to GitHub. The `frontend/` directory can remain in this
   repository as a monorepo, or its contents can be pushed to a separate
   frontend repository.

   ```powershell
   git add frontend
   git commit -m "Prepare frontend for Vercel"
   git push origin main
   ```

2. In Vercel, choose **Add New > Project**, import the GitHub repository, and
   set **Root Directory** to `frontend/` when using this repository as a
   monorepo. This is a standard Next.js App Router project, so Vercel's
   zero-config Next.js detection is sufficient; no `vercel.json` is needed.

3. Add these environment variables in the Vercel project settings:

   ```text
   NEXT_PUBLIC_API_URL=https://ambulance-backend.onrender.com
   NEXT_PUBLIC_WS_URL=wss://ambulance-backend.onrender.com/ws/ambulances
   ```

   Use the actual Render service hostname. The WebSocket URL must use `wss://`
   rather than `ws://` because Render serves the backend over HTTPS.

4. Deploy the project. After changing either environment variable, trigger a
   new Vercel deployment. Public Next.js environment variables are embedded at
   build time, so changes do not affect an already-built deployment.

5. Confirm the dashboard loads and connects. Also set the Render backend's
   `ALLOWED_ORIGINS` value to include the deployed Vercel origin, for example
   `https://your-frontend.vercel.app`.
