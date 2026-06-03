/* Post-build sitemap generator.
 *
 * Writes dist/sitemap.xml with today's date as `lastmod` for every entry so
 * Google's re-crawl heuristic uses fresh dates after every deploy. Replaces
 * the static public/sitemap.xml that used to ship with stale 2026-05-20
 * dates and required hand-editing.
 *
 * Route list is mirrored from src/router/index.ts manually rather than
 * imported, because importing a TS module from a plain Node script needs
 * either a separate tsc step or a loader hook — both heavier than just
 * keeping a 9-line table in sync when routes change.
 *
 * Dynamic routes (/portfolio/:slug, /team-projects/:slug) and the catch-all
 * NotFound route are intentionally excluded. */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://activeinsurancegj.com';
const TODAY = new Date().toISOString().slice(0, 10);

const routes = [
  { path: '/',                      priority: '1.0', changefreq: 'monthly' },
  { path: '/about',                 priority: '0.8', changefreq: 'monthly' },
  { path: '/services',              priority: '0.8', changefreq: 'monthly' },
  { path: '/plans',                 priority: '0.8', changefreq: 'monthly' },
  { path: '/faq',                   priority: '0.8', changefreq: 'monthly' },
  { path: '/contact',               priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy-policy',        priority: '0.3', changefreq: 'yearly'  },
  { path: '/terms-and-conditions',  priority: '0.3', changefreq: 'yearly'  },
  { path: '/accessibility',         priority: '0.3', changefreq: 'yearly'  },
];

const urlsXml = routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;

const target = resolve('dist', 'sitemap.xml');
writeFileSync(target, xml);
console.log(`[sitemap] wrote ${routes.length} URLs to ${target} (lastmod=${TODAY})`);
