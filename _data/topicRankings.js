// Rankings per topic and cohort, in 100-site pages, for the six topic
// templates under content/rankings/ (topic.html in each cohort directory).
// Topics come from audits.json (scripts/topics.js), so a new topic needs no
// new template or data file.
//
// One entry ("chunk") per generated page:
//   { topic, topicName, cohort, pageNumber, pageCount, url, member,
//     pagination, title, descriptionHtml, keywords }
// `member` is that page's rows; `pagination` mirrors the Eleventy pagination
// object (pageNumber, pages, hrefs, href.previous/next) so the template can
// set it and the shared pagination include works unchanged.
//
// Rows are shallow copies carrying the dense rank within this list. The
// per-topic data files this replaces ranked the national list and then
// re-ranked each cohort on the same record objects, so the rank shown on
// /rankings/{topic}/ was the site's rank within its cohort.
//
// A topic with no ranked sites (readability before the auditor emits it)
// still gets one empty page so the topic pill has somewhere to link; the
// table is empty and the charts show no data.
//
// Default export only: a named export would make Eleventy paginate the
// module's export names.

import { default as domainData } from './domains.js';
import { loadAudits } from '../scripts/load-audits.js';
import { topicKeysFrom, topicName } from '../scripts/topics.js';
import { categoryOf } from '../scripts/categories.js';
import { scoreOf } from '../scripts/counties.js';

const PAGE_SIZE = 100;

// Copy for each cohort's pages. `standard` links the topic's standards page.
const COHORTS = {
    overall: {
        path: '',
        title: (t) => `Government websites: ${t} rankings`,
        description: (link) => `Project ScanGov ${link} rankings for every U.S. government website we scan: federal, state, county, city, and public higher education.`,
        keywords: () => 'government domains, government websites',
    },
    cities: {
        path: 'cities/',
        title: (t) => `City websites: ${t} rankings`,
        description: (link) => `Project ScanGov ${link} rankings for U.S. city government websites, with the most common failures.`,
        keywords: (k) => `city government websites, rankings, ${k}`,
    },
    counties: {
        path: 'counties/',
        title: (t) => `County websites: ${t} rankings`,
        description: (link) => `Project ScanGov ${link} rankings for U.S. county government websites, with the most common failures and a page for every state.`,
        keywords: (k) => `county government websites, rankings, ${k}`,
    },
    states: {
        path: 'states/',
        title: (t) => `State websites: ${t} rankings`,
        description: (link) => `Project ScanGov ${link} rankings for U.S. state government websites, with the most common failures.`,
        keywords: (k) => `state government websites, rankings, ${k}`,
    },
    edu: {
        path: 'edu/',
        title: (t) => `Higher education websites: ${t} rankings`,
        description: (link) => `Project ScanGov ${link} rankings for U.S. public college and university websites.`,
        keywords: () => 'government domains, government websites',
    },
    federal: {
        path: 'federal/',
        title: (t) => `Federal websites: ${t} rankings`,
        description: (link) => `Project ScanGov ${link} rankings for U.S. federal government websites.`,
        keywords: () => 'government domains, government websites',
    },
};

// Dense rank on copies: ties share a rank, the next distinct score gets the
// next integer (same rule as addRankingPosition in _data/variables.js).
function rankedCopies(records, topic) {
    const sorted = [...records].sort((a, b) => scoreOf(b, topic) - scoreOf(a, topic));
    let rank = 0;
    let prev = null;
    return sorted.map((d) => {
        const s = scoreOf(d, topic);
        if (s !== prev) {
            rank++;
            prev = s;
        }
        return { ...d, rankingPosition: rank };
    });
}

function chunksFor(rows, topic, topicLabel, cohort, cfg) {
    const base = `/rankings/${cfg.path}${topic}/`;
    const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const hrefs = [];
    for (let i = 0; i < pageCount; i++) hrefs.push(i === 0 ? base : `${base}${i}/`);
    const pages = hrefs.map((_, i) => i);
    const lower = topicLabel.toLowerCase();
    const link = `<a href="https://standards.scangov.org/${topic}/">${lower}</a>`;
    const chunks = [];
    for (let i = 0; i < pageCount; i++) {
        chunks.push({
            topic,
            topicName: topicLabel,
            cohort,
            pageNumber: i,
            pageCount,
            url: hrefs[i],
            member: rows.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
            pagination: {
                pageNumber: i,
                pages,
                hrefs,
                href: {
                    first: hrefs[0],
                    last: hrefs[pageCount - 1],
                    previous: i > 0 ? hrefs[i - 1] : null,
                    next: i < pageCount - 1 ? hrefs[i + 1] : null,
                },
            },
            title: cfg.title(lower),
            descriptionHtml: cfg.description(link),
            keywords: cfg.keywords(lower),
        });
    }
    return chunks;
}

export default async function () {
    const audits = await loadAudits();
    const topics = topicKeysFrom(audits);
    const domains = domainData();
    const out = {};
    for (const cohort of Object.keys(COHORTS)) out[cohort] = [];

    for (const topic of topics) {
        const label = topicName(audits, topic);
        // Only records that carry a score for this topic are ranked; blocked
        // or unreachable homepages (no scores) get "unknown grade" profile
        // pages instead, and a topic the auditor has not emitted yet is empty.
        const scored = domains.filter((d) => Number.isFinite(scoreOf(d, topic)));
        const national = rankedCopies(scored, topic);
        out.overall.push(...chunksFor(national, topic, label, 'overall', COHORTS.overall));
        const byCohort = { cities: [], counties: [], states: [], edu: [], federal: [] };
        for (const d of scored) byCohort[categoryOf(d.urlkey)].push(d);
        for (const cohort of Object.keys(byCohort)) {
            out[cohort].push(...chunksFor(rankedCopies(byCohort[cohort], topic), topic, label, cohort, COHORTS[cohort]));
        }
    }
    return out;
}
