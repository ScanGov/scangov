// Pagination source for content/sitemap-section.njk. Keep this file to a
// single default export: Eleventy paginates the module namespace instead of
// the array when a data file also has named exports.
import { sitemapSections } from '../scripts/sitemap-sections.js';

export default function () {
  return sitemapSections;
}
