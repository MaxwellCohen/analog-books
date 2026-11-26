# Analog Books

Port of the Goodreads "Books" catalog demo to [Analog](https://analogjs.org) 3 (the Angular meta-framework on Vite and Nitro), with Angular 22 SSR, standalone components, signals and Tailwind CSS v4. The markup and styles match the `angular-books` port.

- `/` catalog with search, filters, pagination, API-delay slider and theme toggle; all state lives in URL query params (`search, page, year, rating, pages, language, list, delay`).
- `/:id` book detail. Unknown ids and unknown routes return a real HTTP 404.
- File-based routes: `src/app/pages/index.page.ts`, `[id].page.ts`, `[...not-found].page.ts`. Each page loads its data with a route resolver declared in `routeMeta`.
- Nitro API routes in `src/server/routes/api/books/` (`/api/books`, `/api/books/count`, `/api/books/:id`) run the Drizzle/Neon queries. During SSR, Analog's request-context interceptor calls them in-process and hands the responses to the browser through the HTTP transfer cache.
- Without `POSTGRES_URL` the app serves a small generated preview catalog.

## Environment

Copy `.env.example` to `.env`:

- `POSTGRES_URL` - Neon/Postgres connection string (optional; preview catalog when empty)
- `API_DELAY_MS` - artificial API latency in ms (optional)

## Commands

```sh
pnpm install
pnpm dev        # vite dev server
pnpm build
pnpm preview    # production Node server (PORT, default 3000)
pnpm typecheck
```

## Deployment

The build picks the Nitro preset from the host: Vercel (`VERCEL=1`) and Netlify (`NETLIFY=1`) are detected from their build environment, and Cloudflare Workers uses `BUILD_PRESET=cloudflare-module`. With none of them it builds a Node server.

| Host | URL | Config |
| --- | --- | --- |
| Vercel | https://analog-books.vercel.app | `vercel.json` (Build Output API in `.vercel/output`) |
| Netlify | https://analog-books.netlify.app | `netlify.toml` (publish `dist/analog/public`, function in `dist/analog/server`) |
| Cloudflare Workers | https://analog-books.to-email-max.workers.dev | `wrangler.jsonc` |

- Vercel is connected to this repo: a push to `main` builds and deploys. Netlify and Cloudflare are deployed with `pnpm deploy:netlify` and `pnpm deploy:cloudflare`.

`POSTGRES_URL` is set on every host (Vercel and Netlify environment variable, Cloudflare secret).

### Optimized branch

The `optimized` branch is deployed separately (production branch `optimized`):

| Host | URL |
| --- | --- |
| Vercel | https://analog-books-optimized.vercel.app |
| Netlify | https://analog-books-max-optimized.netlify.app |
| Cloudflare Workers | https://analog-books-optimized.to-email-max.workers.dev |

See [OPTIMIZATIONS.md](OPTIMIZATIONS.md) for each change and whether it is a framework feature or hand-written.
