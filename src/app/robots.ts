import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/auth/', '/dashboard', '/cashout', '/transactions', '/referrals'],
    },
    sitemap: 'https://tapcash.online/sitemap.xml',
  };
}
