import { sanityClient } from './client';
import {
  ACTIVE_PEOPLE_QUERY,
  EVENT_BY_SLUG_QUERY,
  EVENT_SLUGS_QUERY,
  GROUP_BY_SLUG_QUERY,
  GROUP_SLUGS_QUERY,
  GROUPS_QUERY,
  HOME_PAGE_QUERY,
  NEWS_BY_SLUG_QUERY,
  NEWS_LIST_QUERY,
  NEWS_SLUGS_QUERY,
  RECURRING_EVENTS_QUERY,
  SETTINGS_QUERY,
  UPCOMING_EVENTS_LIMIT_QUERY,
  UPCOMING_EVENTS_QUERY,
} from './queries';
import type {
  EventDetail,
  EventSummary,
  GroupDetail,
  GroupSummary,
  HomePage,
  NewsDetail,
  NewsSummary,
  PersonSummary,
  RecurringEvent,
  Settings,
} from './types';

export async function getSettings() {
  return sanityClient.fetch<Settings | null>(SETTINGS_QUERY);
}

export async function getHomePage() {
  return sanityClient.fetch<HomePage | null>(HOME_PAGE_QUERY);
}

export async function getUpcomingEvents() {
  return sanityClient.fetch<EventSummary[]>(UPCOMING_EVENTS_QUERY);
}

export async function getUpcomingEventsLimited(limit: number) {
  return sanityClient.fetch<EventSummary[]>(UPCOMING_EVENTS_LIMIT_QUERY, { limit });
}

export async function getEventBySlug(slug: string) {
  return sanityClient.fetch<EventDetail | null>(EVENT_BY_SLUG_QUERY, { slug });
}

export async function getEventSlugs() {
  return sanityClient.fetch<{ slug: string }[]>(EVENT_SLUGS_QUERY);
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
  return sanityClient.fetch<RecurringEvent[]>(RECURRING_EVENTS_QUERY);
}

export async function getActivePeople() {
  return sanityClient.fetch<PersonSummary[]>(ACTIVE_PEOPLE_QUERY);
}
