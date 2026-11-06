// One entry per Pulse page: the whole list at /pulse/, then one page per
// rankings group at /pulse/{group}/, in the homepage tab order. Each entry
// carries the group's summary (scripts/group-summary.js: counts, averages,
// charts, top failures) plus the copy slots the template needs. Pagination
// source for content/report/index.html. Default export only: a named export
// would make Eleventy paginate the module's export names.

import { default as siteSummary } from './siteSummary.js';
import { default as groupSummaries } from './groupSummaries.js';

// noun: plural for counts ("N county sites"); scope: what we scan, for the
// intro and the data footnote; descNoun: the population in meta descriptions.
const COPY = {
    cities: { noun: 'city sites', scope: 'every city site on our list', descNoun: 'U.S. city websites' },
    counties: { noun: 'county sites', scope: 'every county site on our list', descNoun: 'U.S. county websites' },
    states: { noun: 'state sites', scope: 'the main site of each U.S. state and the District of Columbia', descNoun: 'U.S. state websites' },
    federal: { noun: 'federal sites', scope: 'every federal site on our list', descNoun: 'U.S. federal websites' },
    edu: { noun: 'education sites', scope: 'every public college and university site on our list', descNoun: 'U.S. public college and university websites' },
};

// Pulse nests each failures chart under an h2 section and an h3 indicator
// heading, so the chart title takes h4 (the hubs, which share these specs,
// keep the default). A shallow copy: the summary object is shared.
function withFailuresHeading(summary, headingLevel) {
    const failures = {};
    for (const [topic, spec] of Object.entries(summary.charts.failures)) failures[topic] = { ...spec, headingLevel };
    return { ...summary, charts: { ...summary.charts, failures } };
}

export default async function () {
    const all = await siteSummary();
    const groups = await groupSummaries();
    const pages = [{
        key: 'all',
        label: 'All',
        isAll: true,
        title: 'Pulse',
        permalink: '/pulse/',
        hub: '/rankings/',
        noun: 'sites',
        scope: 'every site on our list',
        description: 'The state of digital experience across every site ScanGov scans.',
        summary: all,
    }];
    for (const g of groups) {
        const copy = COPY[g.key];
        if (!copy) throw new Error(`pulsePages: no copy for group ${g.key}`);
        pages.push({
            key: g.key,
            label: g.label,
            isAll: false,
            title: `Pulse: ${g.label.toLowerCase()}`,
            permalink: `/pulse/${g.key}/`,
            hub: g.hub,
            noun: copy.noun,
            scope: copy.scope,
            description: `The state of digital experience across the ${copy.descNoun} ScanGov scans: grades, how scores are distributed, and the checks these sites fail most.`,
            summary: withFailuresHeading(g, 4),
        });
    }
    return pages;
}
