// Profile pages are one-per-domain; lastmod is that domain's last scan time.
// domain.time is an epoch-millisecond value from the auditor.
export default {
  eleventyComputed: {
    modified: (data) => (data.domain?.time ? new Date(data.domain.time).toISOString() : data.updatedTime?.iso || undefined),
  },
};
