import type { APIRoute } from 'astro';
import { getRecurringEventSlugs, getUpcomingEvents } from '../lib/sanity/api';

// Alle öffentlichen Seiten für Suchmaschinen. Abgelaufene Veranstaltungen fehlen bewusst – ihre
// Seiten bleiben erreichbar, sind aber auf „noindex“ gesetzt (siehe veranstaltungen/[slug].astro).
// Statische Seiten direkt aus src/pages, damit neue Seiten automatisch enthalten sind.
const STATIC_PATHS = Object.keys(import.meta.glob(['./*.astro', './*/index.astro', '!./404.astro']))
  .map((file) => file.replace(/^\./, '').replace(/(index)?\.astro$/, '').replace(/([^/])$/, '$1/'))
  .sort();

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Für die Sitemap muss die Live-Domain (site) gesetzt sein.');

  const [events, recurringEvents] = await Promise.all([getUpcomingEvents(), getRecurringEventSlugs()]);
  const paths = [
    ...STATIC_PATHS,
    ...recurringEvents.map(({ slug }) => `/regelmaessige-veranstaltungen/${slug}/`),
    ...events.map((event) => `/veranstaltungen/${event.slug}/`),
  ];
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const urls = paths.map((path) => `  <url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
