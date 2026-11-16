// The status code pages count the sites with that status, not the whole list, in the
// row above the h1 (_includes/scan-info.html).
export default {
  eleventyComputed: {
    siteCountOverride: (data) => (data.statusPage ? data.statusPage.count : data.siteCountOverride),
  },
};
