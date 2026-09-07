import { describeProfile, profileSchema, summarizeProfile, toJsonLd } from '../../scripts/profile-summary.js';
import { categoryOf } from '../../scripts/categories.js';

// Profile pages are one-per-domain. Each template sets `profileView` so the
// description, breadcrumb, and sitemap lastmod fit that page: overview,
// pulse, changelog, details, report. domain.time is an epoch-millisecond
// scan timestamp from the auditor.
const CATEGORY_LABEL = { states: 'state', cities: 'city', counties: 'county', edu: 'higher education', federal: 'federal' };

export default {
  eleventyComputed: {
    modified: (data) => (data.domain?.time ? new Date(data.domain.time).toISOString() : data.updatedTime?.iso || undefined),
    description: (data) => (data.domain ? describeProfile(data.domain, data.profileView) : undefined),
    schema: (data) => (data.domain ? toJsonLd(profileSchema(data.domain, data.profileView, data.site.url, data.page.url)) : undefined),
    summary: (data) => {
      if (!data.domain || data.profileView !== 'overview') return undefined;
      const category = categoryOf(data.domain.urlkey);
      const summary = summarizeProfile(data.domain, data.audits, data.medians, category);
      return summary ? { ...summary, categoryLabel: CATEGORY_LABEL[category] || category } : undefined;
    },
  },
};
