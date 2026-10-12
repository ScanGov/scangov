// Computed page data for the per-topic rankings templates
// (content/rankings/topic.html and the cohort copies), which paginate
// _data/topicRankings.js one page per entry under the `chunk` alias. Each
// function falls back to the page's own value when there is no chunk, so the
// directory data files that spread these stay valid for every other page.
//
// Numbered pages (/rankings/{topic}/2/) stay out of the sitemap, as they did
// when Eleventy's default pagination left them out of collections.

export function chunkOf(data) {
  return data.chunk && typeof data.chunk === 'object' && data.chunk.topic ? data.chunk : null;
}

export const topicPageComputed = {
  title: (data) => chunkOf(data)?.title ?? data.title,
  descriptionHtml: (data) => chunkOf(data)?.descriptionHtml ?? data.descriptionHtml,
  keywords: (data) => chunkOf(data)?.keywords ?? data.keywords,
  member: (data) => chunkOf(data)?.member ?? data.member,
  // Always a boolean: a computed key that resolves to undefined is stored on
  // the page as an explicit undefined, which the sitemap template's
  // `sitemap != false` test then treats as excluded.
  sitemap: (data) => {
    const chunk = chunkOf(data);
    return chunk ? chunk.pageNumber === 0 : data.sitemap !== false;
  },
};

// The rows and title a schema builder should use for this page.
export function pageMember(data) {
  return chunkOf(data)?.member ?? data.member;
}

export function pageTitle(data) {
  return chunkOf(data)?.title ?? data.title;
}

export function pageDescriptionHtml(data) {
  return chunkOf(data)?.descriptionHtml ?? data.descriptionHtml;
}
