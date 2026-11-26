import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import analog from '@analogjs/platform';
import angular from '@analogjs/vite-plugin-angular';
import nitro from '@analogjs/vite-plugin-nitro';
import type { NitroConfig } from 'nitropack';

const src = fileURLToPath(new URL('./src', import.meta.url));

// The Nitro preset follows the host: Vercel and Netlify are detected from their
// build env, Cloudflare Workers sets BUILD_PRESET=cloudflare-module.
const host = process.env['VERCEL']
  ? 'vercel'
  : process.env['NETLIFY']
    ? 'netlify'
    : process.env['BUILD_PRESET']?.startsWith('cloudflare')
      ? 'cloudflare'
      : 'node';

const PAGE_TTL = 3600;
const QUERY_KEYS = ['search', 'page', 'year', 'rating', 'pages', 'language', 'list', 'delay'];
const immutable = { 'cache-control': 'public, max-age=31536000, immutable' };

// Page caching through Nitro route rules: Vercel ISR, Netlify durable CDN cache,
// and Nitro's own SWR response cache (in KV) on Cloudflare and Node.
const pageRule: NitroConfig['routeRules'] = {
  vercel: { '/**': { isr: { expiration: PAGE_TTL, allowQuery: QUERY_KEYS } }, '/api/**': { isr: false } },
  netlify: { '/**': { isr: PAGE_TTL }, '/api/**': { isr: false } },
  cloudflare: { '/**': { swr: PAGE_TTL }, '/api/**': { cache: false } },
  node: { '/**': { swr: PAGE_TTL }, '/api/**': { cache: false } },
}[host];

// Analog's Nitro plugin gives every route rule a `headers` object, and Vercel
// rejects an empty one. `ssr: true` (the default) makes Analog stamp a header.
function withSsr(rules: NitroConfig['routeRules'] = {}) {
  return Object.fromEntries(Object.entries(rules).map(([path, rule]) => [path, { ...rule, ssr: true }]));
}

// Storage behind Nitro's cache (cached catalog queries and SWR pages).
const cacheStorage = {
  vercel: { driver: 'vercel-runtime-cache' },
  netlify: { driver: 'netlify-blobs', name: 'catalog-cache' },
  cloudflare: { driver: 'cloudflare-kv-binding', binding: 'CATALOG_CACHE' },
  node: { driver: 'memory' },
}[host];

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
    alias: { '@': src },
  },
  plugins: [
    // SSR every request; caching comes from the route rules below.
    analog({ prerender: { routes: [] } }),
    angular(),
    nitro({
      alias: { '@': src },
      future: { nativeSWR: true },
      storage: { cache: cacheStorage },
      routeRules: { ...withSsr(pageRule), '/assets/**': { headers: immutable } },
    }),
    tailwindcss(),
  ],
}));
