import { defineQuery } from 'groq';

const imageFragment = /* groq */ `{
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  alt,
  hotspot,
  crop
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

const seoFragment = /* groq */ `{ title, description }`;

const newsCategoryFragment = /* groq */ `{ _id, title, slug }`;

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

const eventSummaryFragment = /* groq */ `{
  _id,
  title,
  slug,
  "coverImage": coverImage${eventImageFragment},
  excerpt,
  startDateTime,
  endDateTime,
  location,
  targetAudience,
  status,
  isFeatured
}`;

const newsSummaryFragment = /* groq */ `{
  _id,
  title,
  slug,
  "coverImage": coverImage${imageFragment},
  excerpt,
  publishedAt,
  "category": category->${newsCategoryFragment},
  isFeatured
}`;

const groupSummaryFragment = /* groq */ `{
  _id,
  name,
  slug,
  "image": image${imageFragment},
  ageGroup,
  description,
  schedule,
  isActive
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
  cropPosition
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
    footerText,
    legalEntityName,
    legalRepresentative,
    legalAddress,
    legalEmail,
    legalPhone,
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

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "homePage"][0]{
    heroEyebrow,
    heroHeading,
    heroText,
    "heroBackgroundImage": heroBackgroundImage${imageFragment},
    heroBackgroundAlt,
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
    "featuredNews": featuredNews[]->${newsSummaryFragment},
    "featuredEvents": featuredEvents[]->${eventSummaryFragment},
    livestreamVisible,
    livestreamEyebrow,
    livestreamHeadline,
    livestreamText,
    livestreamUrl,
    livestreamButtonText,
    livestreamEmbedUrl,
    livestreamPlatform
  }
`);

export const UPCOMING_EVENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "event" && startDateTime >= now()] | order(startDateTime asc)${eventSummaryFragment}
`);

export const UPCOMING_EVENTS_LIMIT_QUERY = defineQuery(/* groq */ `
  *[_type == "event" && startDateTime >= now()] | order(startDateTime asc)[0...$limit]${eventSummaryFragment}
`);

export const EVENT_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "event" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    "coverImage": coverImage${eventImageFragment},
    excerpt,
    body[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    startDateTime,
    endDateTime,
    location,
    targetAudience,
    registrationLink,
    "contactPerson": contactPerson->${personFragment},
    status,
    isFeatured,
    "seo": seo${seoFragment}
  }
`);

export const EVENT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "event" && defined(slug.current)]{ "slug": slug.current }
`);

export const NEWS_LIST_QUERY = defineQuery(/* groq */ `
  *[_type == "newsPost" && publishedAt <= now() && (!defined(expiresAt) || expiresAt > now())] | order(publishedAt desc)${newsSummaryFragment}
`);

export const NEWS_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "newsPost" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    "coverImage": coverImage${imageFragment},
    excerpt,
    body[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    publishedAt,
    "category": category->${newsCategoryFragment},
    isFeatured,
    "seo": seo${seoFragment}
  }
`);

export const NEWS_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "newsPost" && defined(slug.current)]{ "slug": slug.current }
`);

export const GROUPS_QUERY = defineQuery(/* groq */ `
  *[_type == "group" && isActive == true] | order(name asc)${groupSummaryFragment}
`);

export const GROUP_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "group" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    "image": image${imageFragment},
    ageGroup,
    description,
    schedule,
    "contactPerson": contactPerson->${personFragment},
    contactOptions,
    isActive
  }
`);

export const GROUP_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "group" && defined(slug.current)]{ "slug": slug.current }
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

export const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "aboutPage"][0]{
    eyebrow,
    heading,
    "groupPhoto": groupPhoto${imageFragment},
    intro[]{
      ...,
      _type == "image" => ${imageFragment}
    },
    buttonText,
    buttonLink,
    peopleHeading,
    "people": people[]->${personFragment}
  }
`);
