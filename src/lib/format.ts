import type { EventStatus, PortableTextValue, RecurringEventSummary, ScheduleEntry, SocialPlatform, Weekday } from './sanity/types';

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const dateShortFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dayMonthFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateShort(value: string): string {
  return dateShortFormatter.format(new Date(value));
}

export function formatDayMonth(value: string): string {
  return dayMonthFormatter.format(new Date(value));
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  planned: 'Geplant',
  soldOut: 'Ausverkauft',
  cancelled: 'Abgesagt',
};

export function formatScheduleTime(entry: Pick<ScheduleEntry, 'timeFrom' | 'timeTo'>): string {
  return entry.timeTo ? `${entry.timeFrom}–${entry.timeTo} Uhr` : `${entry.timeFrom} Uhr`;
}

/**
 * Compact one-line summary for cards, e.g. "Dienstag · 16:00–17:30 Uhr" (single entry),
 * "Dienstag · 16:00–18:00 Uhr" (several entries, same weekday), "Montag & Donnerstag"
 * (two weekdays) or "Mehrere Termine" (more than two). Falls back to the legacy
 * weekday/time fields for records that don't have a `schedule` list yet.
 */
export function summarizeSchedule(event: Pick<RecurringEventSummary, 'schedule' | 'weekday' | 'time'>): string | null {
  const entries = event.schedule;

  if (entries && entries.length > 0) {
    const weekdayOrder: Weekday[] = [];
    for (const entry of entries) {
      if (!weekdayOrder.includes(entry.weekday)) weekdayOrder.push(entry.weekday);
    }

    if (weekdayOrder.length > 2) {
      return 'Mehrere Termine';
    }

    if (weekdayOrder.length === 2) {
      return weekdayOrder.map((day) => WEEKDAY_LABELS[day]).join(' & ');
    }

    const weekdayLabel = WEEKDAY_LABELS[weekdayOrder[0]];

    if (entries.length === 1) {
      return `${weekdayLabel} · ${formatScheduleTime(entries[0])}`;
    }

    const earliestStart = [...entries].map((entry) => entry.timeFrom).sort()[0];
    const latestEnd = [...entries].map((entry) => entry.timeTo || entry.timeFrom).sort().at(-1);
    return `${weekdayLabel} · ${earliestStart}–${latestEnd} Uhr`;
  }

  if (event.weekday && event.time) {
    return `${WEEKDAY_LABELS[event.weekday]} · ${event.time}`;
  }

  return null;
}

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  other: 'Website',
};

/*
 * Veranstaltungen: Datum („YYYY-MM-DD“) und Uhrzeit („HH:MM“) werden im CMS als deutsche
 * Ortszeit gepflegt. Für Sortierung, Ablauf und strukturierte Daten werden sie hier in eindeutige
 * Zeitpunkte umgerechnet – ausdrücklich in Europe/Berlin, unabhängig von der Zeitzone des
 * Build-Servers. Intl berücksichtigt dabei Sommer- und Winterzeit automatisch.
 */
export const EVENT_TIME_ZONE = 'Europe/Berlin';

// Geschütztes Leerzeichen vor „Uhr“, damit „Uhr“ nie allein in eine neue Zeile rutscht.
const NBSP = String.fromCharCode(0xa0);

const berlinDateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: EVENT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const berlinPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: EVENT_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

const berlinTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  timeZone: EVENT_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

// Reine Kalenderdaten werden mittags UTC formatiert – so kann keine Zeitzone den Tag verschieben.
const calendar = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', ...options });
const calendarDay = calendar({ day: '2-digit' });
const calendarMonth = calendar({ month: 'short' });
const calendarMonthLong = calendar({ month: 'long' });
const calendarWeekday = calendar({ weekday: 'long' });
const calendarFullDate = calendar({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const calendarShortDate = calendar({ day: '2-digit', month: '2-digit', year: 'numeric' });
const calendarDayMonth = calendar({ day: '2-digit', month: '2-digit' });

const calendarNoon = (dateKey: string) => new Date(`${dateKey}T12:00:00Z`);

/** Kalendertag in Berlin als „YYYY-MM-DD“. */
export function berlinDateKey(date: Date): string {
  return berlinDateKeyFormatter.format(date);
}

/** Uhrzeit in Berlin als „HH:MM“. */
export function berlinTimeKey(date: Date): string {
  return berlinTimeFormatter.format(date);
}

/** Abstand Berliner Ortszeit zu UTC in Millisekunden (+1 h Winterzeit, +2 h Sommerzeit). */
function berlinOffsetMs(date: Date): number {
  const parts = Object.fromEntries(berlinPartsFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - (date.getTime() - date.getUTCMilliseconds());
}

/** Berliner Ortszeit („2026-11-01“, „10:30“) → eindeutiger Zeitpunkt. */
export function berlinWallTimeToDate(dateKey: string, time = '00:00'): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  // Zweiter Durchlauf, falls der erste Schätzwert auf der anderen Seite einer Zeitumstellung liegt.
  const firstGuess = asUtc - berlinOffsetMs(new Date(asUtc));
  return new Date(asUtc - berlinOffsetMs(new Date(firstGuess)));
}

/** Zeitpunkt als ISO-8601 mit Berliner Offset, z. B. „2026-11-01T10:30:00+01:00“. */
export function toBerlinIsoString(date: Date): string {
  const offsetMinutes = Math.round(berlinOffsetMs(date) / 60_000);
  const local = new Date(date.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 19);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  return `${local}${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** Mitternacht (00:00 Berliner Zeit) nach dem angegebenen Kalendertag. */
export function endOfBerlinDay(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  return berlinWallTimeToDate(nextDay);
}

function dayDifference(fromKey: string, toKey: string): number {
  return Math.round((calendarNoon(toKey).getTime() - calendarNoon(fromKey).getTime()) / 86_400_000);
}

export interface EventDateLabels {
  /** Tag zweistellig, z. B. „08“. */
  day: string;
  /** Monat kurz in Großbuchstaben, z. B. „NOV“. */
  month: string;
  /** Monat ausgeschrieben, z. B. „November“. */
  monthLong: string;
  /** z. B. „Sonntag“. */
  weekday: string;
  /** z. B. „Sonntag, 8. November 2026“. */
  fullDate: string;
  /** z. B. „08.11.2026“. */
  shortDate: string;
  /** z. B. „10:30 Uhr“ (bei Altdaten mit Ende auch „10:30–12:00 Uhr“); leer ohne Uhrzeit. */
  timeLabel: string;
  /** z. B. „Sonntag · 10:30 Uhr“. */
  weekdayTimeLabel: string;
}

/**
 * Anzeigetexte für einen Termin. `date`/`time` sind Berliner Ortszeit, `end` (nur Altdaten) ist
 * ein ISO-Zeitpunkt.
 */
export function formatEventDate(event: { date: string; time?: string; end?: string }): EventDateLabels {
  const noon = calendarNoon(event.date);
  const weekday = calendarWeekday.format(noon);
  let timeLabel = event.time ? `${event.time}${NBSP}Uhr` : '';

  if (event.time && event.end) {
    const endDate = new Date(event.end);
    const endTime = berlinTimeKey(endDate);
    const days = dayDifference(event.date, berlinDateKey(endDate));

    if (days === 0) {
      timeLabel = `${event.time}–${endTime}${NBSP}Uhr`;
    } else if (days > 0) {
      const endNoon = calendarNoon(berlinDateKey(endDate));
      const endWeekday = calendarWeekday.format(endNoon);
      // Am Folgetag reicht der Wochentag, bei mehrtägigen Veranstaltungen zusätzlich das Datum.
      const endDay = days === 1 ? endWeekday : `${endWeekday}, ${calendarDayMonth.format(endNoon)}`;
      timeLabel = `${event.time}${NBSP}Uhr – ${endDay}, ${endTime}${NBSP}Uhr`;
    }
  }

  return {
    day: calendarDay.format(noon),
    month: calendarMonth.format(noon).replace('.', '').toUpperCase(),
    monthLong: calendarMonthLong.format(noon),
    weekday,
    fullDate: calendarFullDate.format(noon),
    shortDate: calendarShortDate.format(noon),
    timeLabel,
    weekdayTimeLabel: timeLabel ? `${weekday} · ${timeLabel}` : weekday,
  };
}

/** Reiner Text aus Portable Text (z. B. für Meta-Beschreibungen): Textblöcke mit Leerzeichen verbunden, ohne Formatierung. */
export function portableTextToPlainText(value: PortableTextValue | undefined): string {
  if (!value) return '';
  return value
    .map((block) =>
      block._type === 'block' && Array.isArray(block.children)
        ? block.children.map((child) => (typeof child.text === 'string' ? child.text : '')).join('')
        : '',
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
