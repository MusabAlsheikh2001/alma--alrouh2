/**
 * Writes public/sitemap.xml before every build (npm "prebuild").
 *
 * Pages come from PAGES below; keep it in step with src/app/app.routes.ts.
 * The campaigns page also lists every campaign photo in public/campaigns/, so
 * a new campaign folder shows up in Google Images without editing this file.
 */
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://alma-alrouh.com';
const ROOT = new URL('..', import.meta.url).pathname;
const today = new Date().toISOString().slice(0, 10);

const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/campaigns', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/programs', priority: '0.8', changefreq: 'monthly' },
  { path: '/get-involved', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
  { path: '/faqs', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function campaignImages() {
  const dir = join(ROOT, 'public/campaigns');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const folder of readdirSync(dir).sort()) {
    const full = join(dir, folder);
    if (!statSync(full).isDirectory()) continue;
    for (const file of readdirSync(full).sort()) {
      // Full-size photos and video covers; skip the small variants.
      if (/^v?\d{2}\.webp$/.test(file)) out.push(`${SITE}/campaigns/${folder}/${file}`);
    }
  }
  return out;
}

const images = campaignImages();
const urls = PAGES.map(({ path, priority, changefreq }) => {
  const imgs = path === '/campaigns' ? images : path === '/' ? [`${SITE}/og-image.jpg`] : [];
  return [
    '  <url>',
    `    <loc>${esc(SITE + path)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    ...imgs.map((src) => `    <image:image><image:loc>${esc(src)}</image:loc></image:image>`),
    '  </url>',
  ].join('\n');
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml);
console.log(`sitemap: ${PAGES.length} pages, ${images.length} images`);
