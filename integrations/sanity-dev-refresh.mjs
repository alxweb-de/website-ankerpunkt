import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

// Nur für den lokalen Entwicklungsserver (astro dev): Astro merkt sich dort das Ergebnis von
// getStaticPaths() und berechnet es erst nach einer Dateiänderung neu. Seiten wie die Startseite fragen
// Sanity dagegen bei jedem Aufruf frisch ab – eine neu veröffentlichte Veranstaltung erschien deshalb in
// der Liste, ihre Detailseite lieferte aber 404. Diese Integration lauscht auf veröffentlichte Änderungen
// an Inhalten mit eigenen Detailseiten und sendet dann dasselbe Signal, mit dem Astro bei geänderten
// Inhalten seinen Pfad-Cache leert („astro:content-changed“); ältere Versionen ohne dieses Signal
// erhalten ersatzweise eine gemeldete Änderung der Detailrouten. Es wird keine Datei verändert.
//
// Auf den Build (astro build) und die Live-Website hat das keinen Einfluss: Dort entstehen neue
// Detailseiten ausschließlich durch einen neuen Build.

const DETAIL_TYPES = ['event', 'recurringEvent', 'group', 'newsPost'];
const DETAIL_ROUTES = [
  'src/pages/veranstaltungen/[slug].astro',
  'src/pages/regelmaessige-veranstaltungen/[slug].astro',
  'src/pages/gruppen/[slug].astro',
  'src/pages/neuigkeiten/[slug].astro',
];

/** @param {{ projectId?: string, dataset?: string, apiVersion?: string }} options */
export default function sanityDevRefresh({ projectId, dataset, apiVersion }) {
  return {
    name: 'sanity-dev-refresh',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        if (!projectId || !dataset) return;
        const root = fileURLToPath(new URL('..', import.meta.url));
        const client = createClient({ projectId, dataset, apiVersion: apiVersion || '2024-01-01', useCdn: false });
        let timer;

        const subscription = client
          .listen('*[_type in $types && !(_id in path("drafts.**"))]', { types: DETAIL_TYPES }, { includeResult: false })
          .subscribe({
            next: (update) => {
              if (update.type !== 'mutation') return;
              // Mehrere Änderungen kurz hintereinander (z. B. Veröffentlichen) nur einmal verarbeiten.
              clearTimeout(timer);
              timer = setTimeout(() => {
                const ssr = server.environments?.ssr;
                if (ssr) {
                  ssr.hot.send('astro:content-changed', {});
                  server.environments.client?.hot.send({ type: 'full-reload', path: '*' });
                } else {
                  for (const route of DETAIL_ROUTES) server.watcher.emit('change', join(root, route));
                }
                logger.info('Sanity-Inhalte geändert – Pfade der Detailseiten neu geladen.');
              }, 400);
            },
            error: (error) => logger.warn(`Sanity-Abgleich im Entwicklungsserver nicht verfügbar: ${error.message}`),
          });

        server.httpServer?.once('close', () => subscription.unsubscribe());
      },
    },
  };
}
