import { rankingsSchema, toJsonLd } from '../../scripts/profile-summary.js';
import { topicPageComputed, pageMember, pageTitle, pageDescriptionHtml } from '../../scripts/topic-rankings.js';

// Dataset + ItemList JSON-LD for every rankings page that paginates a
// domain list under the `member` alias, or a topicRankings chunk under the
// `chunk` alias (topic.html in this directory and each cohort directory;
// those pages also take their title, description, keywords, member and
// sitemap flag from the chunk). Redirect stubs in ./redirects have neither
// and get nothing.
function plainText(html) {
  return String(html || '').replace(/<[^>]+>/g, '');
}

export default {
  eleventyComputed: {
    // Listed one by one (not spread) so scripts/check-sitemap-completeness.js
    // can see that `sitemap` is decided per page here.
    title: topicPageComputed.title,
    descriptionHtml: topicPageComputed.descriptionHtml,
    keywords: topicPageComputed.keywords,
    member: topicPageComputed.member,
    sitemap: topicPageComputed.sitemap,
    schema: (data) => {
      const member = pageMember(data);
      const title = pageTitle(data);
      if (!Array.isArray(member) || !title) return undefined;
      const description = data.description || plainText(pageDescriptionHtml(data));
      return toJsonLd(rankingsSchema(member, title, description, data.site.url, data.page.url, data.updatedTime?.iso, data.audits));
    },
  },
};
