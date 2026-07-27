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

export interface EventImage extends SanityImageData {
  displayMode?: ImageDisplayMode;
  cropPosition?: ImageCropPosition;
}

export interface EventSummary {
  _id: string;
  title: string;
  slug: SanitySlug;
  coverImage?: EventImage;
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

export type ImageDisplayMode = 'contain' | 'cover';
export type ImageCropPosition = 'top' | 'center' | 'bottom';

export interface RecurringEventImage extends SanityImageData {
  displayMode?: ImageDisplayMode;
  cropPosition?: ImageCropPosition;
}

export interface ScheduleEntry {
  _key: string;
  weekday: Weekday;
  timeFrom: string;
  timeTo?: string;
  extra?: string;
  note?: string;
}

export interface RecurringEventSummary {
  _id: string;
  title: string;
  slug?: SanitySlug;
  mainImage?: RecurringEventImage;
  schedule?: ScheduleEntry[];
  /** @deprecated Ersetzt durch `schedule`. Nur noch als Fallback für alte Datensätze ohne Termine-Liste. */
  weekday?: Weekday;
  /** @deprecated Ersetzt durch `schedule`. Nur noch als Fallback für alte Datensätze ohne Termine-Liste. */
  time?: string;
  location: string;
  targetAudience?: string;
  excerpt?: string;
  note?: string;
  isActive?: boolean;
  order?: number;
}

export interface RecurringEventDetail extends RecurringEventSummary {
  body?: PortableTextValue;
  contactPersons?: PersonSummary[];
}

export type HeroInfoIcon = 'clock' | 'users' | 'pin';

export interface HeroInfoItem {
  _key: string;
  icon: HeroInfoIcon;
  text: string;
}

export type HeroBackgroundPosition = 'center center' | 'center top' | 'center bottom' | 'left center' | 'right center';
export type HeroTextWidth = 'narrow' | 'normal' | 'wide';
export type HeroBottomFadeStrength = 'subtle' | 'medium' | 'strong';
export type LivestreamPlatform = 'youtube' | 'vimeo' | 'other';

export interface HomePage {
  heroEyebrow?: string;
  heroHeading: string;
  heroText?: string;
  heroBackgroundImage?: SanityImageData;
  heroBackgroundAlt?: string;
  heroBackgroundPosition?: HeroBackgroundPosition;
  heroBackgroundOverlay?: number;
  heroTextWidth?: HeroTextWidth;
  heroBottomFade?: boolean;
  heroBottomFadeStrength?: HeroBottomFadeStrength;
  heroInfoItems?: HeroInfoItem[];
  primaryButton?: CtaLink;
  secondaryButton?: CtaLink;
  featuredNews?: NewsSummary[];
  featuredEvents?: EventSummary[];
  livestreamVisible?: boolean;
  livestreamEyebrow?: string;
  livestreamHeadline?: string;
  livestreamText?: string;
  livestreamUrl?: string;
  livestreamButtonText?: string;
  livestreamEmbedUrl?: string;
  livestreamPlatform?: LivestreamPlatform;
}

export interface AboutPage {
  eyebrow?: string;
  heading?: string;
  groupPhoto?: SanityImageData;
  intro?: PortableTextValue;
  buttonText?: string;
  buttonLink?: string;
  peopleHeading?: string;
  people?: PersonSummary[];
}

export interface Settings {
  churchName: string;
  tagline?: string;
  logo?: SanityImageData;
  address?: Address;
  phone?: string;
  email?: string;
  officeHours?: OfficeHours[];
  contactPerson?: PersonSummary;
  mapsUrl?: string;
  visitHeading?: string;
  visitText?: string;
  visitAddress?: Address;
  visitNote?: string;
  visitButton?: CtaLink;
  socialLinks?: SocialLink[];
  livestreamUrl?: string;
  footerLogo?: SanityImageData;
  footerText?: string;
  legalEntityName?: string;
  legalRepresentative?: string;
  legalAddress?: Address;
  legalEmail?: string;
  legalPhone?: string;
  imprintText?: PortableTextValue;
  privacyText?: PortableTextValue;
  imprintUrl?: string;
  privacyUrl?: string;
}
