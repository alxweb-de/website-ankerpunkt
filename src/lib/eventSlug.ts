// Erzeugt die Internetadresse einer Veranstaltung aus Titel und Datum, z. B.
// „Gottesdienst“ am 01.11.2026 → „gottesdienst-2026-11-01“.
// Gleiche Logik wie im Studio (studio-ankerpunkt/lib/eventSlug.ts), das den Slug beim ersten
// Veröffentlichen speichert. Hier nur Rückfallebene für Termine ohne gespeicherten Slug – Änderungen
// bitte in beiden Dateien vornehmen.

const UMLAUTS: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'ae',
  Ö: 'oe',
  Ü: 'ue',
  ß: 'ss',
  ẞ: 'ss',
};

const MAX_TITLE_LENGTH = 80;

export function slugifyEventTitle(title: string): string {
  const slug = title
    .replace(/[äöüÄÖÜßẞ]/g, (char) => UMLAUTS[char])
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' und ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Lange Titel an einer Wortgrenze kürzen statt mitten im Wort.
  const shortened =
    slug.length > MAX_TITLE_LENGTH ? slug.slice(0, MAX_TITLE_LENGTH + 1).replace(/-[^-]*$/, '') : slug;

  return shortened || 'veranstaltung';
}

/** `date` im Format „YYYY-MM-DD“. */
export function buildEventSlug(title: string, date: string): string {
  return `${slugifyEventTitle(title)}-${date}`;
}

/**
 * Stabile Ergänzung für gleichnamige Veranstaltungen am selben Tag: die ersten Zeichen der
 * Dokument-ID. Sie ändert sich nie, die Adresse bleibt also dauerhaft gleich.
 */
export function eventSlugSuffix(documentId: string): string {
  return documentId
    .replace(/^drafts\./, '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 6)
    .toLowerCase();
}
