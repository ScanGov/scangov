import { describeOrg, orgSchema, toJsonLd } from '../../scripts/profile-summary.js';

// Org pages roll up several domains; lastmod is the newest scan among them.
// Single-domain orgs no longer get a page at all (_data/orgPages.js); the
// sitemap rule below is kept as a guard in case the pagination source ever
// widens again. `orgView` is set per template.
export default {
  eleventyComputed: {
    sitemap: (data) => (data.org?.domains?.length || 0) > 1,
    modified: (data) => {
      const times = (data.org?.domains || []).map((d) => d.time).filter(Boolean);
      return times.length ? new Date(Math.max(...times)).toISOString() : data.updatedTime?.iso || undefined;
    },
    description: (data) => (data.org ? describeOrg(data.org, data.orgView, data.audits) : undefined),
    schema: (data) => (data.org ? toJsonLd(orgSchema(data.org, data.orgView, data.site.url, data.page.url)) : undefined),
  },
};
