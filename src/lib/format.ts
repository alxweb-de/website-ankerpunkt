import type { EventStatus, RecurringEventSummary, ScheduleEntry, SocialPlatform, Weekday } from './sanity/types';

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

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long' });

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateShort(value: string): string {
  return dateShortFormatter.format(new Date(value));
}

export function formatDayMonth(value: string): string {
  return dayMonthFormatter.format(new Date(value));
}

export function formatTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

export function formatWeekdayFromDate(value: string): string {
  return weekdayFormatter.format(new Date(value));
}

export function formatDateTimeRange(start: string, end?: string): string {
  const startDate = new Date(start);
  const datePart = `${weekdayFormatter.format(startDate)}, ${formatDate(start)}`;
  const startTime = formatTime(start);

  if (!end) {
    return `${datePart} · ${startTime} Uhr`;
  }

  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const endTime = formatTime(end);

  if (sameDay) {
    return `${datePart} · ${startTime}–${endTime} Uhr`;
  }

  return `${datePart}, ${startTime} Uhr – ${weekdayFormatter.format(endDate)}, ${formatDate(end)}, ${endTime} Uhr`;
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
