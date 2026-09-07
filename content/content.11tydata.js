// Every page on this site is regenerated from the scan dataset, so the data
// refresh time is the honest default for sitemap lastmod. Profile and org
// pages override this with the domain's own last scan time.
export default {
  eleventyComputed: {
    modified: (data) => data.updatedTime?.iso || undefined,
  },
};
