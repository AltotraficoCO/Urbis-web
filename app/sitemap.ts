import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/sitio';

// El sitio es una sola página: la portada.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 }];
}
