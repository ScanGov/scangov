import { rankingsSchema, toJsonLd } from '../../scripts/profile-summary.js';

// Dataset + ItemList JSON-LD for every rankings page that paginates a
// domain list under the `member` alias. Redirect stubs in ./redirects have
// no `member` and get nothing.
function plainText(html) {
  return String(html || '').replace(/<[^>]+>/g, '');
}

export default {
  eleventyComputed: {
    schema: (data) => {
      if (!Array.isArray(data.member) || !data.title) return undefined;
      const description = data.description || plainText(data.descriptionHtml);
      return toJsonLd(rankingsSchema(data.member, data.title, description, data.site.url, data.page.url, data.updatedTime?.iso));
    },
  },
};
