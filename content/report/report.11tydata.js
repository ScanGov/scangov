// Computed metadata for the Pulse pages (index.html paginates _data/pulsePages.js
// with alias `pp`). The all-sites page keeps the state map unfurl image from
// scripts/og-map.js; the group pages use the site default.
export default {
  eleventyComputed: {
    title: (data) => (data.pp ? data.pp.title : data.title),
    description: (data) => (data.pp ? data.pp.description : data.description),
    ogImage: (data) => (data.pp && data.pp.isAll ? 'pulse-map-og.png' : undefined),
    // The version query busts unfurl caches after each scan.
    ogImageCacheBust: (data) => !!(data.pp && data.pp.isAll),
    ogImageAlt: (data) => (data.pp && data.pp.isAll
      ? 'Map of the United States with each state colored by the overall grade of its main state site'
      : undefined),
    // Structured data for search: the page describes one dataset of scan results.
    schema: (data) => {
      const pp = data.pp;
      if (!pp) return data.schema;
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: pp.title,
        description: pp.description,
        url: `${data.site.url}${pp.permalink}`,
        creator: { '@type': 'Organization', name: data.site.org, url: data.site['org-url'] },
        spatialCoverage: 'United States',
        keywords: ['website accessibility', 'website security', 'website usability', 'website readability', 'bot access', pp.noun],
        dateModified: pp.summary.scanWindow && pp.summary.scanWindow.to ? String(pp.summary.scanWindow.to) : undefined,
        isAccessibleForFree: true,
      }).replace(/</g, '\\u003c');
    },
    // The Download menu in the row above the h1 (_includes/data-download.html).
    dataDownloadKey: (data) => (data.pp ? data.pp.key : data.dataDownloadKey),
    // The group pills above the h1 (_includes/filters-bar.html).
    groupPills: (data) => (data.pp ? { base: '/pulse/', active: data.pp.key, allSegment: '', suffix: '', available: false } : data.groupPills),
    // The "Sites: N" line in the jumbotron shows the group's list size.
    siteCountOverride: (data) => (data.pp && !data.pp.isAll ? data.pp.summary.count : data.siteCountOverride),
  },
};
