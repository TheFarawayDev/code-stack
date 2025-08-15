# Cloudflare Deployment (Next.js on Pages)

This project has been prepared for deployment on **Cloudflare Pages** using **@cloudflare/next-on-pages**.

## Requirements
- Node.js 18+
- `pnpm` (recommended) or `npm`
- A Cloudflare account and the `wrangler` CLI (installed locally via devDependency)

## Scripts
- `pnpm build` — Builds the Next.js project for Cloudflare (`.vercel/output/static`).
- `pnpm cf:dev` — Runs a local Pages dev server to preview the built output.
- `pnpm cf:pages:deploy` — Deploys to your Cloudflare Pages project.
- `pnpm dev` — Standard Next.js dev server for local development.

## Steps
1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Build for Cloudflare:
   ```sh
   pnpm build
   ```

3. (Optional) Preview locally:
   ```sh
   pnpm cf:dev
   ```

4. Deploy to Cloudflare Pages:
   ```sh
   pnpm cf:pages:deploy
   ```

### Notes
- `wrangler.toml` enables `nodejs_compat` to support Node APIs in route handlers.
- Environment variables should be configured in **Cloudflare Pages → Settings → Environment variables**, or in `wrangler.toml` under `[vars]` for local dev.
- If you previously used uptime "keep-alive" scripts, they have been removed as they are unnecessary on Cloudflare.
