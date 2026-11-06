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
    // The "Sites: N" line in the jumbotron shows the group's list size.
    siteCountOverride: (data) => (data.pp && !data.pp.isAll ? data.pp.summary.count : data.siteCountOverride),
  },
};
