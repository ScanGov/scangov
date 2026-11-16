// The numbers for /status/ (content/status/index.html): sites by scan status type, with the
// status codes in each type. Built from statusGroups, so the page, charts and cards agree.
import { default as statusGroups } from './statusGroups.js';

const TYPES = [
    { type: 'active', label: 'Scan successful', heading: 'Scan successful', meaning: 'The homepage loaded normally, so we could scan it and give it a grade.' },
    { type: 'redirect', label: 'Redirect', heading: 'Redirects', meaning: 'The address sends visitors somewhere else. We scan the page it lands on only when the redirect is set up the way scanners expect, so a redirect is usually worth a look.' },
    { type: 'inaccessible', label: 'Inaccessible', heading: 'Inaccessible', meaning: 'The site did not load for our scanner: it was blocked, down, empty, or slow. Visitors, search engines and AI crawlers may be hitting the same wall.' },
];

export default async function () {
    const statuses = await statusGroups();
    const total = statuses.reduce((n, s) => n + s.count, 0);
    const share = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
    const types = TYPES.map(t => {
        const rows = statuses.filter(s => s.type === t.type).map(s => ({ ...s, share: share(s.count) }));
        const count = rows.reduce((n, s) => n + s.count, 0);
        return { ...t, rows, count, share: share(count) };
    });
    return { total, types, byType: Object.fromEntries(types.map(t => [t.type, t])) };
}
