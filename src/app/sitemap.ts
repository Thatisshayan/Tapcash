import { MetadataRoute } from 'next';

const BASE = 'https://tapcash.online';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE + '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: BASE + '/games', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: BASE + '/how-it-works', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: BASE + '/cashPath', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: BASE + '/rewards', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: BASE + '/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: BASE + '/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: BASE + '/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: BASE + '/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: BASE + '/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: BASE + '/cookies', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
