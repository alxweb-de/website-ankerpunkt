// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// Live-Domain für Canonical-URLs und strukturierte Daten, z. B. SITE_URL=https://www.example.de
// (in .env bzw. in den Umgebungsvariablen des Hostings). Ohne Angabe entfallen diese absoluten URLs.
// loadEnv liest .env-Dateien und die Umgebungsvariablen des Prozesses.
const { SITE_URL } = loadEnv('production', '.', '');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: SITE_URL || undefined,
  vite: {
    plugins: [tailwindcss()],
  },
});
