// URLs for sitemap-profiles.xml, generated from data rather than from
// collections.all. In a sharded build no single process renders every profile
// page, so the sitemap cannot be derived from the pages Eleventy saw; the
// single-process build uses the same list so the two never diverge.
//
// Mirrors the profile templates: overview and pulse for every domain in
// `domains`, changelog for every entry in `domain_changelog`. Report and
// details pages carry `sitemap: false` and are omitted. lastmod matches
// profile.11tydata.js: the domain's scan time, else the dataset time.
import slugify from '@sindresorhus/slugify';
import { default as domainJS } from './domains.js';
import { default as domainChangelog } from './domain_changelog.js';
import { default as updatedTime } from './updatedTime.js';

// Same call Eleventy's built-in `slugify` filter makes, so URLs match permalinks.
const slug = (s) => slugify(String(s ?? ''), { decamelize: false });

export default function () {
  const fallback = updatedTime().iso || null;
  const lastmodFor = (time) => (time ? new Date(time).toISOString() : fallback);
  const urls = [];

  for (const d of domainJS()) {
    const s = slug(d.urlkey);
    const lastmod = lastmodFor(d.time);
    urls.push({ url: `/profile/${s}/overall/`, lastmod });
    urls.push({ url: `/profile/${s}/pulse/`, lastmod });
  }
  for (const h of domainChangelog()) {
    urls.push({ url: `/profile/${slug(h.url)}/changelog/`, lastmod: lastmodFor(h.time) });
  }
  return urls;
}
