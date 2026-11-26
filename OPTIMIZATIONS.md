# Optimizations

Changes on the `optimized` branch compared with `main`. Each one is marked **framework** (configuring a built-in Analog, Nitro or Angular feature) or **hand-written** (code or config this repo adds itself).

| # | Change | Kind | Where |
| --- | --- | --- | --- |
| 1 | Page caching through Nitro `routeRules`: `isr` on Vercel (native ISR, 1 hour, every catalog query param cached separately), `isr` on Netlify (Nitro sets `Netlify-CDN-Cache-Control: durable` with stale-while-revalidate), and `swr` on Cloudflare and Node (Nitro's response cache, stored in KV on Cloudflare; each build uses its own cache `group` so cached pages never point at a previous deploy's assets). `/api/**` stays uncached so the API-delay slider still delays client navigations. | framework (Nitro) | `vite.config.ts` |
| 2 | Catalog queries wrapped in Nitro's `defineCachedFunction` (1 hour, stale-while-revalidate). The cache lives in the Nitro `cache` storage mount, backed by unstorage drivers: `vercel-runtime-cache` on Vercel, `netlify-blobs` on Netlify, `cloudflare-kv-binding` (KV namespace `CATALOG_CACHE`) on Cloudflare, memory on Node. The preview catalog is not cached. | framework (Nitro) | `src/features/book/book-queries.server.ts`, `vite.config.ts`, `wrangler.jsonc` |
| 3 | Immutable `Cache-Control` for hashed `/assets/**` (JS, CSS, fonts) through a Nitro route rule `headers`. Nitro writes it to each host's own format: Vercel `config.json` routes, Netlify and Cloudflare `_headers`. | framework (Nitro) | `vite.config.ts` |
| 4 | Book covers use Angular's `NgOptimizedImage` (`ngSrc`, `fill`, `priority`). Above-the-fold covers get `fetchpriority="high"`, eager loading, and a `<link rel="preload" as="image">` that Angular adds to the SSR `<head>`. The other covers are lazy-loaded. | framework (Angular) | `src/app/book/book-cover.ts` |
| 5 | Router preloading with `withPreloading(PreloadAllModules)` passed to `provideFileRouter()`, so the book-detail and not-found page chunks are fetched after the first page loads. | framework (Angular router) | `src/app/app.config.ts` |
| 6 | Geist and Geist Mono self-hosted with `@fontsource-variable/*`, bundled by Vite into hashed `/assets`, replacing the Google Fonts stylesheet and preconnects. Analog has no built-in font optimization; this copies what the other optimized ports do. | hand-written | `src/styles/global.css`, `index.html` |

## Considered and not used

- **Prerendering**: Analog prerenders `/` by default, but both branches turn it off (`prerender.routes: []`). The catalog is driven by query params, and a static `/` would be served for every `/?search=...` URL. ISR (item 1) caches each query combination instead.
- **Streaming SSR** (`experimental.streaming` with `renderStream`): Analog sends streamed documents with `Cache-Control: no-store`, which would turn off the page caching in item 1. Every route also waits on its data resolver before rendering, so streaming would only flush the `<head>` early.
- **Critical CSS inlining**: the Angular CLI inlines critical CSS, but Analog's Vite build has no equivalent. The single 41 kB stylesheet stays render-blocking.
