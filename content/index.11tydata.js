// Search and social metadata for the homepage, built from the scan data so the
// numbers in the snippet are the numbers on the page. The visible h1 and lead
// paragraph stay as written in index.html.
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export default {
  eleventyComputed: {
    // The <title> and og:title (header.html); the h1 keeps `title`.
    seoTitle: () => 'Digital experience monitor: how U.S. websites score',
    description: (data) => {
      const s = data.siteSummary;
      if (!s) return data.description;
      const avg = s.averages && Number.isFinite(s.averages.overall) ? ` The average overall score is ${Math.round(s.averages.overall)} out of 100.` : '';
      return `${s.count.toLocaleString('en-US')} U.S. websites scanned for ${data.topics.sentence}.${avg}`;
    },
    // One JSON-LD graph: who runs the site, site search, and the top five of each
    // rankings group as lists, matching the tables on the page.
    schema: (data) => {
      const site = data.site;
      const modified = data.updatedTime && data.updatedTime.iso;
      const slug = (urlkey) => String(urlkey).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const lists = (data.homepageRankings || []).map((g) => ({
        '@type': 'ItemList',
        name: `Top five ${g.label.toLowerCase()} websites by overall score`,
        url: `${site.url}${g.hub}`,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: g.top.length,
        itemListElement: g.top.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: d.urlkey,
          url: `${site.url}/profile/${slug(d.urlkey)}/overall/`,
        })),
      }));
      return json({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', '@id': `${site['org-url']}/#organization`, name: site.org, url: site['org-url'] },
          {
            '@type': 'WebSite',
            '@id': `${site.url}/#website`,
            name: site.title,
            url: site.url,
            publisher: { '@id': `${site['org-url']}/#organization` },
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/search/?search={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'WebPage',
            '@id': `${site.url}/#webpage`,
            url: site.url,
            isPartOf: { '@id': `${site.url}/#website` },
            dateModified: modified,
          },
          ...lists,
        ],
      });
    },
  },
};
