// One child sitemap per section, listed from the /sitemap.xml index. Order
// matters: a URL belongs to the first section whose prefix matches, and the
// "pages" section with no prefixes takes everything left over. Imported by
// _data/sitemapSections.js (pagination source) and eleventy.config.js (filter).
export const sitemapSections = [
  { name: 'profiles', prefixes: ['/profile/'] },
  { name: 'orgs', prefixes: ['/org/'] },
  { name: 'rankings', prefixes: ['/rankings/', '/map/'] },
  { name: 'pages', prefixes: [] },
];

export function sitemapSectionFor(url) {
  for (const section of sitemapSections) {
    if (section.prefixes.some((p) => url.startsWith(p))) return section.name;
  }
  return 'pages';
}
