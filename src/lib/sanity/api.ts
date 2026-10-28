import { sanityClient } from './client';
import { normalizeEvents } from '../events';
import {
  ABOUT_PAGE_QUERY,
  CONTACT_PAGE_QUERY,
  ACTIVE_PEOPLE_QUERY,
  EVENTS_QUERY,
  HOME_PAGE_QUERY,
  RECURRING_EVENT_BY_SLUG_QUERY,
  RECURRING_EVENT_SLUGS_QUERY,
  RECURRING_EVENTS_QUERY,
  SETTINGS_QUERY,
  TOPIC_PAGE_QUERY,
} from './queries';
import type {
  AboutPage,
  ContactPage,
  EventRecord,
  HomePage,
  PersonSummary,
  RecurringEventDetail,
  RecurringEventSummary,
  Settings,
  TopicPage,
} from './types';

export async function getSettings() {
  return sanityClient.fetch<Settings | null>(SETTINGS_QUERY);
}

export async function getHomePage() {
  return sanityClient.fetch<HomePage | null>(HOME_PAGE_QUERY);
}

export async function getAboutPage() {
  return sanityClient.fetch<AboutPage | null>(ABOUT_PAGE_QUERY);
}

export async function getContactPage() {
  return sanityClient.fetch<ContactPage | null>(CONTACT_PAGE_QUERY);
}

export async function getTopicPage(id: string) {
  return sanityClient.fetch<TopicPage | null>(TOPIC_PAGE_QUERY, { id });
}

/** Alle Veranstaltungen, chronologisch sortiert und mit eindeutigen Slugs (siehe lib/events.ts). */
export async function getEvents() {
  return normalizeEvents(await sanityClient.fetch<EventRecord[]>(EVENTS_QUERY));
}

/** Kommende Veranstaltungen: Termine, deren Tag (bzw. bei Altdaten deren Ende) noch nicht vorbei ist. */
export async function getUpcomingEvents(now = Date.now()) {
  return (await getEvents()).filter((event) => event.visibleUntil > now);
}

export async function getRecurringEvents() {
  return sanityClient.fetch<RecurringEventSummary[]>(RECURRING_EVENTS_QUERY);
}

export async function getRecurringEventBySlug(slug: string) {
  return sanityClient.fetch<RecurringEventDetail | null>(RECURRING_EVENT_BY_SLUG_QUERY, { slug });
}

export async function getRecurringEventSlugs() {
  return sanityClient.fetch<{ slug: string }[]>(RECURRING_EVENT_SLUGS_QUERY);
}

export async function getActivePeople() {
  return sanityClient.fetch<PersonSummary[]>(ACTIVE_PEOPLE_QUERY);
}
