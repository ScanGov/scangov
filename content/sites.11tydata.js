// Search and social metadata for /sites/, built from the same numbers as the page.
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const fmt = (n) => Number(n).toLocaleString('en-US');

export default {
  eleventyComputed: {
    seoTitle: (data) => (data.sitesPage ? `Sites: ${fmt(data.sitesPage.total)} U.S. websites we scan` : data.seoTitle),
    description: (data) => {
      const p = data.sitesPage;
      if (!p || !data.topics) return data.description;
      return `${fmt(p.total)} U.S. state, county, city, federal, and public college and university websites, scanned for ${data.topics.sentence}. ${fmt(p.scored)} have a grade.`;
    },
    schema: (data) => {
      const p = data.sitesPage;
      if (!p) return data.schema;
      const site = data.site;
      return json({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Dataset',
            name: 'Websites scanned by Project ScanGov',
            description: `Every website on Project ScanGov's list: ${fmt(p.total)} U.S. websites in five groups, with each site's scan results and grades.`,
            url: `${site.url}/sites/`,
            creator: { '@type': 'Organization', name: site.org, url: site['org-url'] },
            spatialCoverage: 'United States',
            keywords: ['U.S. websites', 'state websites', 'county websites', 'city websites', 'federal websites', 'college websites'],
            dateModified: data.updatedTime && data.updatedTime.iso,
            isAccessibleForFree: true,
            license: 'https://creativecommons.org/licenses/by/4.0/',
            variableMeasured: ['rank', 'site', 'organization', 'scanned', 'overall_score', 'overall_grade', ...(data.topics ? data.topics.keys.flatMap(k => [`${k}_score`, `${k}_grade`]) : []), 'report'],
            sameAs: 'https://data.scangov.org/datasets/homepage-audits/',
            distribution: [
              { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${site.url}/data/rankings/all.csv` },
              { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${site.url}/data/rankings/all.json` },
            ],
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
              { '@type': 'ListItem', position: 2, name: 'Sites', item: `${site.url}/sites/` },
            ],
          },
        ],
      });
    },
  },
};
