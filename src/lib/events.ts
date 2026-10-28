import { buildEventSlug, eventSlugSuffix } from './eventSlug';
import { berlinDateKey, berlinTimeKey, berlinWallTimeToDate, endOfBerlinDay, portableTextToPlainText } from './format';
import type { EventItem, EventRecord } from './sanity/types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(\d{1,2})[:.](\d{2})$/;

/** „9:30“ / „09.30“ → „09:30“; ungültige Angaben → undefined. */
function normalizeTime(value?: string): string | undefined {
  const match = value?.trim().match(TIME_PATTERN);
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return undefined;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Bereitet die Veranstaltungen aus Sanity für die Website auf:
 * - Datum, „Uhrzeit von“ und optional „Uhrzeit bis“ (deutsche Ortszeit) → eindeutige Zeitpunkte;
 *   Altdaten ohne `date`/`time`
 *   werden aus `startDateTime` abgeleitet (bis die Migration gelaufen ist).
 * - Eindeutige Slugs: Gespeicherte Slugs bleiben unverändert (bestehende Links funktionieren
 *   weiter). Termine ohne Slug erhalten „titel-YYYY-MM-DD“; ist die Adresse bereits vergeben,
 *   kommt eine stabile Ergänzung aus der Dokument-ID dazu.
 * - Chronologische Sortierung nach Datum und Uhrzeit.
 *
 * `records` muss nach `_createdAt` aufsteigend sortiert sein: Bei doppelten Slugs behält der
 * ältere Termin seine Adresse.
 */
export function normalizeEvents(records: EventRecord[]): EventItem[] {
  const usedSlugs = new Set<string>();
  const prepared: (Omit<EventItem, 'slug' | 'href'> & { storedSlug?: string })[] = [];

  for (const record of records) {
    const title = record.title?.trim();
    if (!title) continue;

    const legacyStart = record.startDateTime ? new Date(record.startDateTime) : undefined;
    const date = record.date ?? (legacyStart ? berlinDateKey(legacyStart) : undefined);
    if (!date || !DATE_PATTERN.test(date)) continue;

    const time = normalizeTime(record.time) ?? (!record.date && legacyStart ? berlinTimeKey(legacyStart) : undefined);
    const start = berlinWallTimeToDate(date, time);

    // „Uhrzeit bis“ gilt nur, wenn sie am selben Tag nach dem Beginn liegt – ein früheres Ende wird
    // nicht stillschweigend als „Folgetag“ gedeutet, sondern ignoriert.
    const endTime = time ? normalizeTime(record.endTime) : undefined;
    const sameDayEnd = endTime && endTime > time! ? berlinWallTimeToDate(date, endTime) : undefined;

    // Ohne „Uhrzeit bis“: Ein altes Ende gilt nur, solange der Beginn noch dem alten Beginn
    // entspricht – wurden Datum oder Uhrzeit inzwischen im CMS geändert, wäre es nicht verlässlich.
    const legacyEnd = record.endDateTime ? new Date(record.endDateTime) : undefined;
    const end =
      sameDayEnd ??
      (!record.endTime && legacyEnd && legacyStart?.getTime() === start.getTime() && legacyEnd.getTime() > start.getTime()
        ? legacyEnd
        : undefined);

    prepared.push({
      id: record._id,
      title,
      date,
      time,
      start: start.toISOString(),
      end: end?.toISOString(),
      // Ohne Ende bleibt ein Termin bis zum Ende seines Tages „kommend“.
      visibleUntil: (end ?? endOfBerlinDay(date)).getTime(),
      status: record.status,
      coverImage: record.coverImage?.asset ? record.coverImage : undefined,
      description: portableTextToPlainText(record.description) ? record.description : undefined,
      excerpt: record.excerpt?.trim() || undefined,
      body: record.body?.length ? record.body : undefined,
      location: record.location?.trim() || undefined,
      targetAudience: record.targetAudience?.trim() || undefined,
      registrationLink: record.registrationLink || undefined,
      contactPerson: record.contactPerson ?? undefined,
      storedSlug: record.slug?.current?.trim() || undefined,
    });
  }

  const reserve = (slug: string, id: string) => {
    const unique = usedSlugs.has(slug) ? `${slug}-${eventSlugSuffix(id)}` : slug;
    usedSlugs.add(unique);
    return unique;
  };

  // Gespeicherte Slugs zuerst vergeben, damit sie Vorrang vor automatisch erzeugten haben.
  const slugs = new Map<string, string>();
  for (const event of prepared) {
    if (event.storedSlug) slugs.set(event.id, reserve(event.storedSlug, event.id));
  }
  for (const event of prepared) {
    if (!event.storedSlug) slugs.set(event.id, reserve(buildEventSlug(event.title, event.date), event.id));
  }

  return prepared
    .map(({ storedSlug: _storedSlug, ...event }) => {
      const slug = slugs.get(event.id)!;
      return { ...event, slug, href: `/veranstaltungen/${slug}` };
    })
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title, 'de'));
}
