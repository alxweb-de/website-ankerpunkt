import type { ArbitraryTypedObject, PortableTextBlock } from '@portabletext/types';

export type PortableTextValue = (PortableTextBlock | ArbitraryTypedObject)[];

export interface SanitySlug {
  current: string;
}

export interface SanityImageData {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number };
    };
  };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface CtaLink {
  label: string;
  url: string;
}

export interface SeoData {
  title?: string;
  description?: string;
}

export interface Address {
  street: string;
  zip: string;
  city: string;
}

export interface OfficeHours {
  _key: string;
  label: string;
  hours: string;
}

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'telegram'
  | 'whatsapp'
  | 'other';

export interface SocialLink {
  _key: string;
  platform: SocialPlatform;
  url: string;
}

export type ContactOptionType = 'email' | 'phone' | 'whatsapp' | 'link' | 'other';

export interface ContactOption {
  _key: string;
  type: ContactOptionType;
  label?: string;
  value: string;
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface WeeklySchedule {
  weekday: Weekday;
  time: string;
  location?: string;
}

export interface PersonSummary {
  _id: string;
  name: string;
  role?: string;
  photo?: SanityImageData;
  email?: string;
  phone?: string;
  responsibleAreas?: string[];
  isActive?: boolean;
  order?: number;
}

export interface NewsCategory {
  _id: string;
  title: string;
  slug: SanitySlug;
}

export type EventStatus = 'planned' | 'soldOut' | 'cancelled';

export interface EventSummary {
  _id: string;
  title: string;
  slug: SanitySlug;
  coverImage?: SanityImageData;
  excerpt: string;
  startDateTime: string;
  endDateTime?: string;
  location: string;
  targetAudience?: string;
  status: EventStatus;
  isFeatured?: boolean;
}

export interface EventDetail extends EventSummary {
  body?: PortableTextValue;
  registrationLink?: string;
  contactPerson?: PersonSummary;
  seo?: SeoData;
}

export interface NewsSummary {
  _id: string;
  title: string;
  slug: SanitySlug;
  coverImage?: SanityImageData;
  excerpt: string;
  publishedAt: string;
  category?: NewsCategory;
  isFeatured?: boolean;
}

export interface NewsDetail extends NewsSummary {
  body?: PortableTextValue;
  seo?: SeoData;
}

export interface GroupSummary {
  _id: string;
  name: string;
  slug: SanitySlug;
  image?: SanityImageData;
  ageGroup?: string;
  description?: string;
  schedule?: WeeklySchedule;
  isActive?: boolean;
}

export interface GroupDetail extends GroupSummary {
  contactPerson?: PersonSummary;
  contactOptions?: ContactOption[];
}

export interface RecurringEvent {
  _id: string;
  title: string;
  weekday: Weekday;
  time: string;
  location: string;
  targetAudience?: string;
  excerpt?: string;
  contactPerson?: PersonSummary;
  isActive?: boolean;
  order?: number;
}

export interface AnkerpunktSection {
  heading?: string;
  text?: string;
  image?: SanityImageData;
  link?: CtaLink;
}

export interface LivestreamSection {
  isVisible?: boolean;
  heading?: string;
  text?: string;
  overrideUrl?: string;
}

export interface HomePage {
  heroEyebrow?: string;
  heroHeading: string;
  heroText?: string;
  heroImage?: SanityImageData;
  primaryButton?: CtaLink;
  secondaryButton?: CtaLink;
  featuredNews?: NewsSummary[];
  featuredEvents?: EventSummary[];
  ankerpunktSection?: AnkerpunktSection;
  livestreamSection?: LivestreamSection;
}

export interface Settings {
  churchName: string;
  logo?: SanityImageData;
  address?: Address;
  phone?: string;
  email?: string;
  officeHours?: OfficeHours[];
  socialLinks?: SocialLink[];
  livestreamUrl?: string;
  footerText?: string;
  imprintUrl?: string;
  privacyUrl?: string;
}
