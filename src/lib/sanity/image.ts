import { createImageUrlBuilder } from '@sanity/image-url';
import type { ImageUrlBuilder, SanityImageSource } from '@sanity/image-url';
import { dataset, projectId } from './client';

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
  return builder.image(source);
}
