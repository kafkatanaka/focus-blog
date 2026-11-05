import { defineMiddleware } from 'astro:middleware';
import { injectCtaSlots } from './lib/cta-render';

/**
 * Runs for every page (including static prerender at build time).
 * Swaps `<!-- CTA_SLOT: xxx -->` markers for affiliate boxes defined in
 * src/data/affiliate-offers.ts.
 */
export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) return res;
  const html = await res.text();
  if (!html.includes('CTA_SLOT')) {
    return new Response(html, { status: res.status, headers: res.headers });
  }
  return new Response(injectCtaSlots(html, import.meta.env.DEV), {
    status: res.status,
    headers: res.headers,
  });
});
