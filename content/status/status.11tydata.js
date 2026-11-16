// The status code pages count the sites with that status, not the whole list, in the
// row above the h1 (_includes/scan-info.html). The /status/ page itself (no statusPage)
// gets its search and social metadata from the same numbers as the page.
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const fmt = (n) => Number(n).toLocaleString('en-US');

export default {
  eleventyComputed: {
    siteCountOverride: (data) => (data.statusPage ? data.statusPage.count : data.siteCountOverride),
    // Page 1 of each status code is in the sitemap; the numbered pages after it are not.
    sitemap: (data) => (data.statusPage && data.statusPage.pageNum > 0 ? false : true),
    seoTitle: (data) => {
      const s = data.statusSummary;
      if (data.statusPage || !s) return data.seoTitle;
      return 'Scan status: why some websites can’t be scanned';
    },
    description: (data) => {
      const s = data.statusSummary;
      if (data.statusPage || !s) return data.description;
      const t = s.byType;
      const parts = [`${fmt(t.active.count)} scanned`, t.redirect.count ? `${fmt(t.redirect.count)} redirects` : '', t.inaccessible.count ? `${fmt(t.inaccessible.count)} inaccessible` : ''].filter(Boolean);
      return `${fmt(s.total)} websites by scan status: ${parts.join(', ')}. See what each HTTP status code means and how to fix it.`;
    },
    schema: (data) => {
      const sp = data.statusPage;
      if (sp && sp.pageNum === 0 && data.site) {
        const site = data.site;
        const url = `${site.url}/status/${sp.code}/`;
        return json({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: `${sp.code} ${sp.label}`,
              url,
              description: sp.description,
              dateModified: data.updatedTime && data.updatedTime.iso,
              isPartOf: { '@type': 'WebSite', name: site.title, url: `${site.url}/` },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
                { '@type': 'ListItem', position: 2, name: 'Scan status', item: `${site.url}/status/` },
                { '@type': 'ListItem', position: 3, name: `${sp.code} ${sp.label}`, item: url },
              ],
            },
          ],
        });
      }
      const s = data.statusSummary;
      if (sp || !s) return data.schema;
      const site = data.site;
      return json({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            name: 'Scan status of websites',
            url: `${site.url}/status/`,
            description: `How ${fmt(s.total)} websites break down by scan status, with what each HTTP status code means and how to fix it.`,
            dateModified: data.updatedTime && data.updatedTime.iso,
            isPartOf: { '@type': 'WebSite', name: site.title, url: `${site.url}/` },
          },
          {
            '@type': 'Dataset',
            name: 'Scan status of websites scanned by Project ScanGov',
            description: `Every HTTP status code the scanner found, with its type and the number of sites out of ${fmt(s.total)}.`,
            url: `${site.url}/status/`,
            creator: { '@type': 'Organization', name: site.org, url: site['org-url'] },
            spatialCoverage: 'United States',
            dateModified: data.updatedTime && data.updatedTime.iso,
            isAccessibleForFree: true,
            license: 'https://creativecommons.org/licenses/by/4.0/',
            variableMeasured: ['status_code', 'status_label', 'status_type', 'scan_status', 'sites', 'share_of_sites'],
            distribution: [
              { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${site.url}/data/status/all.csv` },
              { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${site.url}/data/status/all.json` },
            ],
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
              { '@type': 'ListItem', position: 2, name: 'Status', item: `${site.url}/status/` },
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: (data.statusFaq || []).map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ],
      });
    },
  },
};
