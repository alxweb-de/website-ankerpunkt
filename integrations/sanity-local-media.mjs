import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Datenschutz: Besucher sollen beim Seitenaufruf keine Verbindung zum Sanity-CDN aufbauen. Nach jedem
// Build (astro build) durchsucht diese Integration alle erzeugten HTML-Seiten – auch die dynamischen
// Detailseiten – nach Bild- und Datei-Adressen von cdn.sanity.io, lädt jede Datei genau in der Form
// herunter, in der Sanity sie für diese Stelle ausliefert (Größe, Zuschnitt, Hotspot bleiben also
// unverändert), legt sie unter /media/sanity/ ab und stellt die Verweise auf diese lokalen Pfade um.
//
// - Sanity bleibt das CMS: Ein geändertes Bild hat in Sanity eine neue Adresse und wird deshalb beim
//   nächsten Build automatisch neu geladen. Bereits geladene Dateien liegen in einem Cache
//   (node_modules/.cache/sanity-media), damit nicht jeder Build alles erneut herunterlädt.
// - og:image und strukturierte Daten (JSON-LD) liest nur der Crawler, nicht der Browser der Besucher.
//   Mit gesetzter Live-Domain (SITE_URL) zeigen sie auf die lokale Datei, ohne bleibt die Sanity-Adresse,
//   weil eine relative Adresse dort nicht gültig wäre.
// - Lässt sich eine Datei nicht laden, bricht der Build ab, statt unbemerkt externe Verweise zu behalten.
// - Der Entwicklungsserver (astro dev) bleibt unverändert und lädt direkt von Sanity.

const SANITY_URL = /https:\/\/cdn\.sanity\.io\/(?:images|files)\/[^\s"'<>)\\]+/g;
// Nur Crawler lesen diese Stellen (siehe oben).
const CRAWLER_ONLY = /<meta\b[^>]*(?:property="og:image"|name="twitter:image")[^>]*>|<script\b[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/g;
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'application/pdf': '.pdf',
};
const OUTPUT_DIR = 'media/sanity';
// Wie ein Browser anfragen: Bei Adressen mit „auto=format“ liefert Sanity dann WebP statt des
// (oft viel größeren) Originalformats – genau das, was Besucher bisher direkt von Sanity erhielten.
// WebP unterstützen alle aktuellen Browser. Ohne „auto=format“ hat die Angabe keine Wirkung.
const ACCEPT = 'image/webp,image/*;q=0.8,*/*;q=0.5';
const CONCURRENCY = 6;

/** Adresse aus dem HTML (mit &amp; usw.) → echte Download-Adresse. */
function decode(raw) {
  return raw
    .replace(/(?:&#39;|&#x27;|&quot;|[,.;])+$/, '')
    .replace(/&amp;/g, '&');
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

async function download(url, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { Accept: ACCEPT } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const type = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
      return { data: Buffer.from(await response.arrayBuffer()), type };
    } catch (error) {
      if (attempt >= attempts) throw new Error(`Sanity-Datei konnte nicht geladen werden (${url}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export default function sanityLocalMedia() {
  let site;
  let base = '/';

  return {
    name: 'sanity-local-media',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site;
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const cacheDir = fileURLToPath(new URL('../node_modules/.cache/sanity-media/', import.meta.url));
        const outDir = join(distDir, OUTPUT_DIR);
        await mkdir(cacheDir, { recursive: true });
        await mkdir(outDir, { recursive: true });

        // 1. Alle Seiten lesen und die benötigten Adressen sammeln.
        const pages = [];
        const urls = new Set();
        for await (const path of htmlFiles(distDir)) {
          const html = await readFile(path, 'utf8');
          if (!html.includes('cdn.sanity.io')) continue;
          pages.push({ path, html });
          const browserPart = site ? html : html.replace(CRAWLER_ONLY, '');
          for (const [raw] of browserPart.matchAll(SANITY_URL)) urls.add(decode(raw));
        }
        if (urls.size === 0) return;

        // 2. Herunterladen (bzw. aus dem Cache nehmen) und nach dist/media/sanity kopieren.
        const cached = new Map((await readdir(cacheDir)).map((name) => [name.replace(/\.[^.]+$/, ''), name]));
        const localPaths = new Map();
        let downloaded = 0;
        let bytes = 0;
        const queue = [...urls];
        await Promise.all(
          Array.from({ length: CONCURRENCY }, async () => {
            for (let url = queue.shift(); url; url = queue.shift()) {
              const hash = createHash('sha256').update(`${ACCEPT} ${url}`).digest('hex').slice(0, 20);
              let name = cached.get(hash);
              if (!name) {
                const { data, type } = await download(url);
                name = `${hash}${EXTENSIONS[type] ?? (extname(new URL(url).pathname) || '.bin')}`;
                await writeFile(join(cacheDir, name), data);
                downloaded++;
              }
              await copyFile(join(cacheDir, name), join(outDir, name));
              localPaths.set(url, `${base}${OUTPUT_DIR}/${name}`);
            }
          }),
        );
        for (const local of new Set(localPaths.values())) {
          bytes += (await stat(join(outDir, local.split('/').pop()))).size;
        }

        // 3. Verweise umstellen. Crawler-Stellen nur mit Live-Domain (absolute Adresse), sonst unverändert.
        const toLocal = (text, absolute) =>
          text.replace(SANITY_URL, (raw) => {
            const local = localPaths.get(decode(raw));
            if (!local) return raw;
            const suffix = raw.slice(raw.replace(/(?:&#39;|&#x27;|&quot;|[,.;])+$/, '').length);
            return (absolute ? new URL(local, site).href : local) + suffix;
          });
        for (const page of pages) {
          const kept = [];
          let html = page.html.replace(CRAWLER_ONLY, (match) => {
            kept.push(site ? toLocal(match, true) : match);
            return `\u0000${kept.length - 1}\u0000`;
          });
          html = toLocal(html, false).replace(/\u0000(\d+)\u0000/g, (_, index) => kept[Number(index)]);
          await writeFile(page.path, html);
        }

        logger.info(
          `${localPaths.size} Sanity-Dateien lokal bereitgestellt (${(bytes / 1024 / 1024).toFixed(1)} MB, ` +
            `${downloaded} neu geladen) in ${pages.length} Seiten.`,
        );
      },
    },
  };
}
