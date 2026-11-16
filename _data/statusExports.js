// The status page as downloadable files (content/data/status-csv.njk and status-json.njk):
// `all` lists every status code with its type and the number of sites, and one file per
// code lists the sites with that status. Built from statusGroups, so the files match the
// page. Default export only.
import { default as statusGroups } from './statusGroups.js';

const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default async function () {
    const statuses = await statusGroups();
    const total = statuses.reduce((n, s) => n + s.count, 0);
    const all = statuses.map(s => ({
        status_code: s.code,
        status_label: s.label,
        status_type: s.type,
        scan_status: s.scangovStatus,
        sites: s.count,
        share_of_sites: total ? Math.round((s.count / total) * 1000) / 1000 : 0,
    }));
    const lists = statuses.map(s => {
        const rows = s.domains.map(d => ({
            site: d.urlkey,
            organization: d.name || '',
            status_code: s.code,
            status_label: s.label,
            status_type: s.type,
            report: `https://scangov.org/profile/${slug(d.urlkey)}/overall/`,
        }));
        return { key: String(s.code), columns: ['site', 'organization', 'status_code', 'status_label', 'status_type', 'report'], rows };
    });
    return [{ key: 'all', columns: Object.keys(all[0] || {}), rows: all }, ...lists];
}
