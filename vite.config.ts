import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import analog from '@analogjs/platform';
import angular from '@analogjs/vite-plugin-angular';
import nitro from '@analogjs/vite-plugin-nitro';

const src = fileURLToPath(new URL('./src', import.meta.url));

// https://vitejs.dev/config/
// The Nitro preset follows the host: Vercel and Netlify are detected from their
// build env, Cloudflare Workers sets BUILD_PRESET=cloudflare-module.
export default defineConfig(() => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
    alias: { '@': src },
  },
  plugins: [
    // SSR every request like the other ports; Analog prerenders "/" by default.
    analog({ prerender: { routes: [] } }),
    angular(),
    nitro({ alias: { '@': src } }),
    tailwindcss(),
  ],
}));
