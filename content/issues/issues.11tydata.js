// Computed metadata for the issue pages (issue.html). Falls back to the
// page's own values so index.html in this directory is unaffected.
//
// Titles follow the query-bearing pattern from ../notes/plans/06: under 60
// characters before header.html appends the site name.

const fmt = new Intl.NumberFormat('en-US');

export default {
  eleventyComputed: {
    title: (data) => (data.item ? data.item.title : data.title),
    description: (data) => {
      const it = data.item;
      if (!it) return data.description;
      return `${fmt.format(it.failCount)} of ${fmt.format(it.testedCount)} fully scanned U.S. ${it.group.singular} government websites ${it.issue.failPhrase}. A map, the share in each state, and every site listed, from ScanGov homepage scans.`;
    },
    breadcrumbParent: (data) => (data.item ? [{ title: 'Issues', url: '/issues/' }] : data.breadcrumbParent),
    breadcrumbCurrent: (data) => (data.item ? data.item.title : data.breadcrumbCurrent),
    // The "Sites: N" line in the jumbotron is rendered by the layout; show the
    // group's list size, not the whole dataset.
    siteCountOverride: (data) => (data.item ? data.item.count : data.siteCountOverride),
  },
};
