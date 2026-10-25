import { sanityClient } from './client';
import { normalizeEvents } from '../events';
import {
  ABOUT_PAGE_QUERY,
  ACTIVE_PEOPLE_QUERY,
  EVENTS_QUERY,
  GROUP_BY_SLUG_QUERY,
  GROUP_SLUGS_QUERY,
  GROUPS_QUERY,
  HOME_PAGE_QUERY,
  NEWS_BY_SLUG_QUERY,
  NEWS_LIST_QUERY,
  NEWS_SLUGS_QUERY,
  RECURRING_EVENT_BY_SLUG_QUERY,
  RECURRING_EVENT_SLUGS_QUERY,
  RECURRING_EVENTS_QUERY,
  SETTINGS_QUERY,
  TOPIC_PAGE_QUERY,
} from './queries';
import type {
  AboutPage,
  EventRecord,
  GroupDetail,
  GroupSummary,
  HomePage,
  NewsDetail,
  NewsSummary,
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

export async function getNewsList() {
  return sanityClient.fetch<NewsSummary[]>(NEWS_LIST_QUERY);
}

export async function getNewsBySlug(slug: string) {
  return sanityClient.fetch<NewsDetail | null>(NEWS_BY_SLUG_QUERY, { slug });
}

export async function getNewsSlugs() {
  return sanityClient.fetch<{ slug: string }[]>(NEWS_SLUGS_QUERY);
}

export async function getGroups() {
  return sanityClient.fetch<GroupSummary[]>(GROUPS_QUERY);
}

export async function getGroupBySlug(slug: string) {
  return sanityClient.fetch<GroupDetail | null>(GROUP_BY_SLUG_QUERY, { slug });
}

export async function getGroupSlugs() {
  return sanityClient.fetch<{ slug: string }[]>(GROUP_SLUGS_QUERY);
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
