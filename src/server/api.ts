import { getQuery, type H3Event } from 'h3';
import { waitForApiDelay } from '@/lib/api-delay';
import { getApiDelayMs, parseSearchParams } from '@/lib/url-state';
import type { RawSearchParams } from '@/lib/url-state';

/** Parses the catalog query params and applies the requested API delay. */
export async function readSearchParams(event: H3Event) {
  const raw: RawSearchParams = {};
  for (const [key, value] of Object.entries(getQuery(event))) {
    raw[key] = Array.isArray(value) ? String(value[0]) : value == null ? undefined : String(value);
  }
  const params = parseSearchParams(raw);
  await waitForApiDelay(getApiDelayMs(params));
  return params;
}
