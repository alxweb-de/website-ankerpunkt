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

export interface SanityFileData {
  asset?: {
    _id: string;
    url: string;
    mimeType?: string;
  };
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

/**
 * Veranstaltung, wie sie aus Sanity kommt. Gepflegt werden nur Titel, Datum und Uhrzeit; der Slug
 * wird beim ersten Veröffentlichen automatisch gesetzt. Alle übrigen Felder sind Altdaten, die im
 * Studio ausgeblendet sind und – falls vorhanden – weiterhin angezeigt werden.
 */
export interface EventRecord {
  _id: string;
  _createdAt: string;
  title?: string;
  slug?: SanitySlug;
  /** Kalenderdatum in deutscher Zeit, „YYYY-MM-DD“. */
  date?: string;
  /** „Uhrzeit von“: Beginn in deutscher Zeit, „HH:MM“. */
  time?: string;
  /** „Uhrzeit bis“ (optional): Ende am selben Tag, „HH:MM“. */
  endTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  coverImage?: EventImage;
  excerpt?: string;
  body?: PortableTextValue;
  location?: string;
  targetAudience?: string;
  registrationLink?: string;
  contactPerson?: PersonSummary;
  status?: EventStatus;
}

/** Aufbereitete Veranstaltung für die Website (siehe lib/events.ts). */
export interface EventItem {
  id: string;
  title: string;
  /** Eindeutiger Slug, auch für Termine ohne gespeicherten Slug. */
  slug: string;
  href: string;
  /** Kalenderdatum in deutscher Zeit, „YYYY-MM-DD“. */
  date: string;
  /** Beginn in deutscher Zeit, „HH:MM“ (fehlt nur bei unvollständigen Daten). */
  time?: string;
  /** Beginn als ISO-Zeitpunkt (UTC). */
  start: string;
  /** Ende als ISO-Zeitpunkt – nur, wenn tatsächlich eine Endzeit gepflegt ist („Uhrzeit bis“ oder Altdaten). */
  end?: string;
  /** Bis zu diesem Zeitpunkt (ms) gilt der Termin als „kommend“: Ende bzw. Ende des Termintags. */
  visibleUntil: number;
  status?: EventStatus;
  coverImage?: EventImage;
  excerpt?: string;
  body?: PortableTextValue;
  location?: string;
  targetAudience?: string;
  registrationLink?: string;
  contactPerson?: PersonSummary;
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
export type HeroBackgroundType = 'image' | 'video';
export type HeroTextWidth = 'narrow' | 'normal' | 'wide';
export type HeroBottomFadeStrength = 'subtle' | 'medium' | 'strong';
export type LivestreamPlatform = 'youtube' | 'vimeo' | 'other';
export type CoreTopicIcon = 'community' | 'faith' | 'support' | 'none';

export interface CoreTopic {
  _key: string;
  title: string;
  text?: string;
  image?: SanityImageData;
  icon?: CoreTopicIcon;
  link: string;
}

export interface HomePage {
  heroIdentityName?: string;
  heroIdentityTagline?: string;
  heroEyebrow?: string;
  heroHeading: string;
  heroBibleReference?: string;
  heroText?: string;
  heroBackgroundType?: HeroBackgroundType;
  heroBackgroundImage?: SanityImageData;
  heroBackgroundAlt?: string;
  heroBackgroundVideo?: SanityFileData;
  heroVideoPoster?: SanityImageData;
  heroVideoDisableOnMobile?: boolean;
  heroBackgroundPosition?: HeroBackgroundPosition;
  heroBackgroundOverlay?: number;
  heroTextWidth?: HeroTextWidth;
  heroBottomFade?: boolean;
  heroBottomFadeStrength?: HeroBottomFadeStrength;
  heroInfoItems?: HeroInfoItem[];
  primaryButton?: CtaLink;
  secondaryButton?: CtaLink;
  coreTopicsHeading?: string;
  coreTopics?: CoreTopic[];
  upcomingEventsHeading?: string;
  upcomingEventsText?: string;
  upcomingEventsLimit?: number;
  upcomingEventsHideWhenEmpty?: boolean;
  featuredNews?: NewsSummary[];
  featuredEvents?: EventRecord[];
  livestreamVisible?: boolean;
  livestreamEyebrow?: string;
  livestreamHeadline?: string;
  livestreamText?: string;
  livestreamUrl?: string;
  livestreamButtonText?: string;
  livestreamEmbedUrl?: string;
  livestreamPlatform?: LivestreamPlatform;
}

export interface TopicPageHighlight {
  _key: string;
  title: string;
  text?: string;
}

export interface TopicPage {
  eyebrow?: string;
  heading: string;
  intro?: string;
  image?: SanityImageData;
  body?: PortableTextValue;
  highlights?: TopicPageHighlight[];
  primaryButton?: CtaLink;
  secondaryButton?: CtaLink;
  // Neuer Seitenaufbau (z. B. „Unterstützung erleben“)
  heroEyebrow?: string;
  heroHeading?: string;
  heroText?: string;
  heroBackgroundType?: HeroBackgroundType;
  heroImage?: SanityImageData;
  heroVideo?: SanityFileData;
  heroPosition?: AboutHeroPosition;
  heroOverlay?: AboutHeroOverlay;
  introHeading?: string;
  introText?: PortableTextValue;
  sections?: TopicSectionData[];
  // „Glauben entdecken“
  faithHeading?: string;
  faithIntro?: string;
  serviceHeading?: string;
  serviceText?: PortableTextValue;
  serviceNote?: string;
  serviceEvent?: { title?: string; slug?: string; isActive?: boolean };
  serviceLinkText?: string;
  serviceImage?: CaptionedImageData;
  homeGroupHeading?: string;
  homeGroupText?: PortableTextValue;
  homeGroupNote?: string;
  homeGroupContact?: PersonSummary;
  homeGroupImage?: CaptionedImageData;
  jesusHeading?: string;
  jesusText?: PortableTextValue;
  jesusButtonText?: string;
  jesusButtonUrl?: string;
  bookVisible?: boolean;
  bookHeading?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookText?: PortableTextValue;
  bookCover?: SanityImageData;
  bookPdfUrl?: string;
  bookButtonText?: string;
  contactHeading?: string;
  contactText?: PortableTextValue;
  contactPerson?: PersonSummary;
  contactPersonLabel?: string;
  buttonText?: string;
  buttonLink?: string;
  seo?: SeoData;
  seoImage?: SanityImageData;
}

export interface TopicSectionData {
  _key: string;
  heading: string;
  body?: PortableTextValue;
  image?: CaptionedImageData;
  imagePosition?: 'auto' | 'left' | 'right';
}

export type AboutHeroOverlay = 'light' | 'medium' | 'strong';
export type AboutHeroPosition = 'auto' | HeroBackgroundPosition;
export type CoreValueIcon = 'cross' | 'heart' | 'community' | 'path' | 'place' | 'none';

export interface CaptionedImageData extends SanityImageData {
  caption?: string;
}

export interface CoreValue {
  _key: string;
  title: string;
  text?: string;
  icon?: CoreValueIcon;
  image?: SanityImageData;
}

export interface CreedItem {
  _key: string;
  title: string;
  body?: PortableTextValue;
  bibleVerses?: string[];
}

export interface FreeChurchPrinciple {
  _key: string;
  title: string;
  text?: string;
}

export interface AboutPage {
  heroEyebrow?: string;
  heroHeading?: string;
  heroText?: string;
  heroBackgroundType?: HeroBackgroundType;
  heroImage?: SanityImageData;
  heroVideo?: SanityFileData;
  heroPosition?: AboutHeroPosition;
  heroOverlay?: AboutHeroOverlay;
  whoHeading?: string;
  whoLead?: string;
  whoText?: PortableTextValue;
  groupPhoto?: CaptionedImageData;
  valuesHeading?: string;
  valuesText?: string;
  coreValues?: CoreValue[];
  creedHeading?: string;
  creedText?: string;
  creedItems?: CreedItem[];
  creedSourceText?: string;
  creedSourceUrl?: string;
  freeChurchHeading?: string;
  freeChurchIntro?: string;
  freeChurchPrinciples?: FreeChurchPrinciple[];
  freeChurchText?: PortableTextValue;
  freeChurchClosing?: string;
  freeChurchImage?: CaptionedImageData;
  peopleHeading?: string;
  people?: PersonSummary[];
  contactHeading?: string;
  contactText?: string;
  buttonText?: string;
  buttonLink?: string;
  seo?: SeoData;
  seoImage?: SanityImageData;
}

export interface Settings {
  churchName: string;
  tagline?: string;
  logo?: SanityImageData;
  logoLight?: SanityImageData;
  logoDark?: SanityImageData;
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
