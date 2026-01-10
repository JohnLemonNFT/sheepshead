import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://playsheepshead.org';

  // Static pages
  const staticPages = [
    '',
    '/rules',
    '/rules/card-hierarchy',
    '/rules/point-values',
    '/rules/following-suit',
    '/rules/scoring',
    '/rules/called-ace',
    '/rules/jack-of-diamonds',
    '/rules/leaster',
    '/rules/cracking',
    '/rules/doublers',
    '/rules/blitz',
    '/rules/3-player',
    '/rules/4-player',
    '/strategy',
    '/strategy/when-to-pick',
    '/strategy/what-to-bury',
    '/strategy/partner-selection',
    '/strategy/leading',
    '/strategy/schmearing',
    '/strategy/defense',
    '/learn',
    '/learn/history',
    '/learn/glossary',
    '/learn/sheepshead-vs-euchre',
    '/glossary',
    '/faq',
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.split('/').length === 2 ? 0.8 : 0.6,
  }));
}
