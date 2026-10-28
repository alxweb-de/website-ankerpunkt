import { defineQuery } from 'groq';

const imageFragment = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  alt,
  hotspot,
  crop,
  aiGenerated
}`;

const captionedImageFragment = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  alt,
  caption,
  hotspot,
  crop,
  aiGenerated
}`;

const personFragment = /* groq */ `{
  _id,
  name,
  role,
  "photo": photo${imageFragment},
  email,
  phone,
  responsibleAreas,
  isActive,
  order
}`;

const ctaFragment = /* groq */ `{ label, url }`;

const fileFragment = /* groq */ `{
  asset->{
    _id,
    url,
    mimeType
  }
}`;

const seoFragment = /* groq */ `{ title, description }`;

const eventImageFragment = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  alt,
  displayMode,
  cropPosition
}`;

const eventFragment = /* groq */ `{
  _id,
  _createdAt,
  title,
  slug,
  date,
  time,
  endTime,
  startDateTime,
  endDateTime,
  "coverImage": coverImage${eventImageFragment},
  excerpt,
  location,
  targetAudience,
  registrationLink,
  status
}`;

const recurringEventImageFragment = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  alt,
  hotspot,
  crop,
  displayMode,
  cropPosition,
  aiGenerated
}`;

const scheduleEntryFragment = /* groq */ `{
  _key,
  weekday,
  timeFrom,
  timeTo,
  extra,
  note
}`;

const recurringEventSummaryFragment = /* groq */ `{
  _id,
  title,
  slug,
  "mainImage": mainImage${recurringEventImageFragment},
  "schedule": schedule[]${scheduleEntryFragment},
  weekday,
  time,
  location,
  targetAudience,
  excerpt,
  note,
  isActive,
  order
}`;

const logoImageFragment = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { dimensions { width, height } }
  },
  alt
}`;

export const SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "settings"][0]{
    churchName,
    tagline,
    "logo": logo${logoImageFragment},
    "logoLight": logoLight${logoImageFragment},
    "logoDark": logoDark${logoImageFragment},
    address,
    phone,
    email,
    officeHours,
    "contactPerson": contactPerson->${personFragment},
    mapsUrl,
    visitHeading,
    visitText,
    visitAddress,
    visitNote,
    "visitButton": visitButton${ctaFragment},
    socialLinks,
    livestreamUrl,
    "footerLogo": footerLogo${logoImageFragment},
    "footerSecondaryLogo": footerSecondaryLogo{ asset->{ _id, url, metadata { dimensions { width, height } } }, alt, link },
    footerNavigation[]{ _key, label, href, isActive },
    footerVisit,
    footerText,
    footerCreditEnabled,
    footerCreditLabel,
    footerCreditUrl,
    imprintText[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    privacyText[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    imprintUrl,
    privacyUrl
  }
`);

const coreTopicFragment = /* groq */ `{
  _key,
  title,
  text,
  "image": image${imageFragment},
  icon,
  link
}`;

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "homePage"][0]{
    heroIdentityName,
    heroIdentityTagline,
    heroEyebrow,
    heroHeading,
    heroBibleReference,
    heroText,
    heroBackgroundType,
    "heroBackgroundImage": heroBackgroundImage${imageFragment},
    heroBackgroundAlt,
    "heroBackgroundVideo": heroBackgroundVideo${fileFragment},
    "heroVideoPoster": heroVideoPoster${imageFragment},
    heroVideoDisableOnMobile,
    heroBackgroundPosition,
    heroBackgroundOverlay,
    heroTextWidth,
    heroBottomFade,
    heroBottomFadeStrength,
    heroInfoItems[]{
      _key,
      icon,
      text
    },
    "primaryButton": primaryButton${ctaFragment},
    "secondaryButton": secondaryButton${ctaFragment},
    coreTopicsHeading,
    "coreTopics": coreTopics[]${coreTopicFragment},
    upcomingEventsHeading,
    upcomingEventsText,
    upcomingEventsLimit,
    upcomingEventsHideWhenEmpty,
    "featuredEvents": featuredEvents[]->${eventFragment},
    livestreamVisible,
    livestreamEyebrow,
    livestreamHeadline,
    livestreamText,
    livestreamUrl,
    livestreamButtonText,
    livestreamEmbedUrl,
    livestreamPlatform,
    donationEnabled,
    donationHeading,
    donationText,
    donationButtonText,
    donationUrl
  }
`);

// Alle Veranstaltungen (wenige Dutzend). Sortierung, Ablauf und eindeutige Slugs werden in
// lib/events.ts in deutscher Zeit berechnet – das funktioniert auch für Altdaten, die nur
// `startDateTime` statt `date`/`time` besitzen.
export const EVENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "event" && defined(title) && (defined(date) || defined(startDateTime))] | order(_createdAt asc){
    _id,
    _createdAt,
    title,
    slug,
    date,
    time,
    endTime,
    description,
    startDateTime,
    endDateTime,
    "coverImage": coverImage${eventImageFragment},
    excerpt,
    body[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    location,
    targetAudience,
    registrationLink,
    "contactPerson": contactPerson->${personFragment},
    status
  }
`);

export const RECURRING_EVENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "recurringEvent" && isActive == true] | order(order asc)${recurringEventSummaryFragment}
`);

export const RECURRING_EVENT_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "recurringEvent" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    "mainImage": mainImage${recurringEventImageFragment},
    "schedule": schedule[]${scheduleEntryFragment},
    weekday,
    time,
    location,
    targetAudience,
    excerpt,
    note,
    body[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    "contactPersons": contactPersons[]->${personFragment},
    isActive,
    order
  }
`);

export const RECURRING_EVENT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "recurringEvent" && isActive == true && defined(slug.current)]{ "slug": slug.current }
`);

export const ACTIVE_PEOPLE_QUERY = defineQuery(/* groq */ `
  *[_type == "person" && isActive == true] | order(order asc)${personFragment}
`);

export const TOPIC_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "topicPage" && _id == $id][0]{
    eyebrow,
    heading,
    intro,
    "image": image${imageFragment},
    body[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    highlights[]{
      _key,
      title,
      text
    },
    "primaryButton": primaryButton${ctaFragment},
    "secondaryButton": secondaryButton${ctaFragment},
    heroEyebrow,
    heroHeading,
    heroText,
    heroBackgroundType,
    "heroImage": heroImage${imageFragment},
    "heroVideo": heroVideo${fileFragment},
    heroPosition,
    heroOverlay,
    introHeading,
    introText,
    sections[]{ _key, heading, body, "image": image${captionedImageFragment}, imagePosition },
    faithHeading,
    faithIntro,
    serviceHeading,
    serviceText,
    serviceNote,
    "serviceEvent": serviceEvent->{ title, "slug": slug.current, isActive },
    serviceLinkText,
    "serviceImage": serviceImage${captionedImageFragment},
    homeGroupHeading,
    homeGroupText,
    homeGroupNote,
    "homeGroupContact": homeGroupContact->${personFragment},
    "homeGroupImage": homeGroupImage${captionedImageFragment},
    jesusHeading,
    jesusText,
    jesusButtonText,
    jesusButtonUrl,
    bookVisible,
    bookHeading,
    bookTitle,
    bookAuthor,
    bookText,
    "bookCover": bookCover${imageFragment},
    bookPdfUrl,
    bookButtonText,
    heroSubtitle,
    "welcomeLogo": welcomeLogo${imageFragment},
    welcomeHeading,
    welcomeText,
    "welcomeImage": welcomeImage${captionedImageFragment},
    ideaHeading,
    ideaText,
    ideaPoints[]{ _key, title, text, icon, "image": image${imageFragment} },
    joinHeading,
    joinText,
    joinButtonText,
    joinEmail,
    "joinContactPerson": joinContactPerson->${personFragment},
    joinMailSubject,
    joinFallbackLink,
    galleryVisible,
    galleryHeading,
    galleryImages[]${captionedImageFragment},
    contactHeading,
    contactText,
    "contactPerson": contactPerson->${personFragment},
    contactPersonLabel,
    buttonText,
    buttonLink,
    "seo": seo${seoFragment},
    "seoImage": seoImage${imageFragment}
  }
`);

export const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "aboutPage"][0]{
    heroEyebrow,
    heroHeading,
    heroText,
    heroBackgroundType,
    "heroImage": heroImage${imageFragment},
    "heroVideo": heroVideo${fileFragment},
    heroPosition,
    heroOverlay,
    whoHeading,
    whoLead,
    whoText,
    "groupPhoto": groupPhoto${captionedImageFragment},
    valuesHeading,
    valuesText,
    coreValues[]{ _key, title, text, icon, "image": image${imageFragment} },
    creedHeading,
    creedText,
    creedItems[]{ _key, title, body, bibleVerses },
    creedSourceText,
    creedSourceUrl,
    freeChurchHeading,
    freeChurchIntro,
    freeChurchPrinciples[]{ _key, title, text },
    freeChurchText,
    freeChurchClosing,
    "freeChurchImage": freeChurchImage${captionedImageFragment},
    peopleHeading,
    "people": people[]->${personFragment},
    contactHeading,
    contactText,
    buttonText,
    buttonLink,
    "seo": seo${seoFragment},
    "seoImage": seoImage${imageFragment}
  }
`);

export const CONTACT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "contactPage"][0]{
    heroEyebrow,
    heroHeading,
    heroText,
    heroBackgroundType,
    "heroImage": heroImage${imageFragment},
    "heroVideo": heroVideo${fileFragment},
    heroPosition,
    heroOverlay,
    waysHeading,
    writeHeading,
    writeText,
    writeButtonText,
    visitHeading,
    visitButtonText,
    timesHeading,
    "seo": seo${seoFragment},
    "seoImage": seoImage${imageFragment}
  }
`);
