// Search and social metadata for the indicator pages (hub.html paginates
// _data/indicatorPages.js with alias `ip`). The numbers in the title, description and
// structured data are the numbers on the page, from the same summary.
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function facts(data) {
  const topic = data.ip && data.ip.topic;
  const info = topic && data.audits && data.audits[topic];
  const summary = data.siteSummary;
  if (!info || !summary) return null;
  const avg = summary.averages && Number.isFinite(summary.averages[topic]) ? Math.round(summary.averages[topic]) : null;
  return { topic, info, summary, avg, label: info.displayName, lower: info.displayName.toLowerCase() };
}

export default {
  eleventyComputed: {
    // The h1 is the indicator's name; the <title> says what the page is about.
    title: (data) => { const f = facts(data); return f ? f.label : data.title; },
    seoTitle: (data) => { const f = facts(data); return f ? `${f.label}: how U.S. websites score` : data.seoTitle; },
    description: (data) => {
      const f = facts(data);
      if (!f) return data.description;
      const avg = f.avg !== null ? ` The average score is ${f.avg} out of 100.` : '';
      const lead = `${f.summary.scoredCount.toLocaleString('en-US')} U.S. websites checked for ${f.lower}.${avg}`;
      const about = String(f.info.description || '');
      return lead.length + about.length < 158 ? `${lead} ${about}` : lead;
    },
    breadcrumbCurrent: (data) => { const f = facts(data); return f ? f.label : data.breadcrumbCurrent; },
    schema: (data) => {
      const f = facts(data);
      if (!f) return data.schema;
      return json({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `${f.label}: how U.S. websites score`,
        description: `Scores for ${f.lower} across ${f.summary.scoredCount.toLocaleString('en-US')} fully scanned U.S. websites, with the most common failures.`,
        url: `${data.site.url}/${f.topic}/`,
        creator: { '@type': 'Organization', name: data.site.org, url: data.site['org-url'] },
        spatialCoverage: 'United States',
        keywords: [f.lower, `website ${f.lower}`, 'website scores', 'U.S. websites'],
        dateModified: data.updatedTime && data.updatedTime.iso,
        isAccessibleForFree: true,
      });
    },
  },
};
