// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import sanityDevRefresh from './integrations/sanity-dev-refresh.mjs';
import sanityLocalMedia from './integrations/sanity-local-media.mjs';

// Live-Domain für Canonical-URLs, Sitemap und strukturierte Daten. Standard ist ef-horhausen.de;
// SITE_URL (in .env bzw. in den Umgebungsvariablen) überschreibt sie, z. B. für eine Testumgebung.
// loadEnv liest .env-Dateien und die Umgebungsvariablen des Prozesses.
const { SITE_URL = 'https://ef-horhausen.de' } = loadEnv('production', '.', '');
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SANITY_API_VERSION } = loadEnv('development', '.', '');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: SITE_URL || 'https://ef-horhausen.de',
  // Nur im Entwicklungsserver aktiv: neue/gelöschte Veranstaltungen ohne Neustart (siehe Datei).
  integrations: [
    sanityDevRefresh({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: PUBLIC_SANITY_API_VERSION,
    }),
    // Nur im Build: Bilder, Logos und Videos aus Sanity werden lokal mit ausgeliefert (siehe Datei).
    sanityLocalMedia(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
