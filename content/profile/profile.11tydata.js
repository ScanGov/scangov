import { describeProfile, profileSchema, summarizeProfile, toJsonLd } from '../../scripts/profile-summary.js';
import { categoryOf } from '../../scripts/categories.js';
import { siteContext } from '../../scripts/site-context.js';
import slugify from '@sindresorhus/slugify';

// Profile pages are one-per-domain. Each template sets `profileView` so the
// description, breadcrumb, and sitemap lastmod fit that page: overview,
// pulse, changelog, details, report. domain.time is an epoch-millisecond
// scan timestamp from the auditor.
//
// Only the overview (/overall/) is indexed: the other views canonical to it,
// because Search Console showed the views competing for the same queries
// (plan 06). Report and details also carry sitemap: false.
const CATEGORY_LABEL = { states: 'state', cities: 'city', counties: 'county', edu: 'higher education', federal: 'federal' };

export default {
  eleventyComputed: {
    canonical: (data) => {
      if (!data.domain || data.profileView === 'overview') return undefined;
      const key = data.domain.urlkey || data.domain.url;
      return `${data.site.url}/profile/${slugify(String(key), { decamelize: false })}/overall/`;
    },
    modified: (data) => (data.domain?.time ? new Date(data.domain.time).toISOString() : data.updatedTime?.iso || undefined),
    description: (data) => (data.domain ? describeProfile(data.domain, data.profileView) : undefined),
    // Where this site sits in the rankings (group hub, and the state page for
    // counties), plus the size of that state's county list for the summary.
    siteContext: (data) => {
      if (!data.domain) return undefined;
      const context = siteContext(data.domain, data.stateNames);
      if (context.stateCode && Array.isArray(data.countyStates)) {
        const st = data.countyStates.find((s) => s.code === context.stateCode);
        if (st) context.stateSiteCount = st.count;
      }
      return context;
    },
    schema: (data) => (data.domain ? toJsonLd(profileSchema(data.domain, data.profileView, data.site.url, data.page.url, data.siteContext)) : undefined),
    summary: (data) => {
      if (!data.domain || data.profileView !== 'overview') return undefined;
      const category = categoryOf(data.domain.urlkey);
      const summary = summarizeProfile(data.domain, data.audits, data.medians, category);
      return summary ? { ...summary, categoryLabel: CATEGORY_LABEL[category] || category } : undefined;
    },
  },
};
