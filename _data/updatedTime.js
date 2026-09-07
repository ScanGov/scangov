import * as fs from 'fs';

// When the scan data behind this build was last refreshed (see updates.js for
// the display string). Used as the sitemap lastmod for every page that is
// regenerated from the dataset rather than tied to one domain's scan time.
export default function () {
  try {
    const ms = parseInt(fs.readFileSync('./public/data/updated_time', 'utf8'), 10);
    if (!Number.isNaN(ms)) return { ms, iso: new Date(ms).toISOString() };
  } catch (e) {
    console.warn('updatedTime: could not read public/data/updated_time', e.message);
  }
  return { ms: null, iso: null };
}
