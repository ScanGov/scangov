// Org pages roll up several domains; lastmod is the newest scan among them.
// Single-domain orgs duplicate that domain's profile, so they stay out of
// the sitemap (this replaces a string-valued front matter flag that was
// never falsy and listed every org page).
export default {
  eleventyComputed: {
    sitemap: (data) => (data.org?.domains?.length || 0) > 1,
    modified: (data) => {
      const times = (data.org?.domains || []).map((d) => d.time).filter(Boolean);
      return times.length ? new Date(Math.max(...times)).toISOString() : data.updatedTime?.iso || undefined;
    },
  },
};
