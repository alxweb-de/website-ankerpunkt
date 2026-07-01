import type { EventStatus, SocialPlatform, Weekday } from './sanity/types';

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

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  other: 'Website',
};
