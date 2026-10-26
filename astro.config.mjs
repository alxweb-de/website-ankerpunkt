// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import sanityDevRefresh from './integrations/sanity-dev-refresh.mjs';

// Live-Domain für Canonical-URLs und strukturierte Daten, z. B. SITE_URL=https://www.example.de
// (in .env bzw. in den Umgebungsvariablen des Hostings). Ohne Angabe entfallen diese absoluten URLs.
// loadEnv liest .env-Dateien und die Umgebungsvariablen des Prozesses.
const { SITE_URL } = loadEnv('production', '.', '');
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SANITY_API_VERSION } = loadEnv('development', '.', '');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: SITE_URL || undefined,
  // Nur im Entwicklungsserver aktiv: neue/gelöschte Veranstaltungen ohne Neustart (siehe Datei).
  integrations: [
    sanityDevRefresh({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: PUBLIC_SANITY_API_VERSION,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
