import { createClient } from '@sanity/client';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
export const dataset = import.meta.env.PUBLIC_SANITY_DATASET;
export const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // This is a fully static site (output: "static") — every build is already its own cache
  // layer. Reading through Sanity's API CDN on top of that risks a build picking up a
  // stale response right after publishing in Studio, which reads as "my change isn't showing
  // up" even though the build itself is correct. Going straight to the live API guarantees
  // each build reflects whatever is actually published at that moment.
  useCdn: false,
  perspective: 'published',
});
