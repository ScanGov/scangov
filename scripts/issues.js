// Issue pages: every site in one group that fails one check, with a map, a
// state breakdown and the full list. /issues/{issue}/{group}/.
//
// ISSUES and GROUPS are the configuration; buildIssuePage() turns one pair
// into everything its template needs. Populations follow group-summary.js:
// a site counts as fully scanned when it responded with page content
// (isScored); only fully scanned sites can pass or fail a check, so every
// share on the page is failing / fully scanned. A fully scanned site whose
// record lacks the check is "not tested" and is named as such, never counted
// as passing.

import { TOPICS, isCounty, stateCodeOf, isResponding, scoreOf, domainKey } from './counties.js';
import { isScored, attributeIndex, scanWindow } from './group-summary.js';
import { joinCounties } from './county-geo.js';
import { slugify, formatCount } from './charts/format.js';

// One entry per check that gets a page. `slug` is the URL segment, `topic`
// and `check` locate the result on a record, and the labels feed titles,
// legends and table headers. `breakdown` (optional) buckets the failing sites
// for a "what they use instead" bar chart.
export const ISSUES = [
    {
        slug: 'not-dotgov',
        topic: 'security',
        check: 'dotgov',
        // "County websites not on a .gov domain"
        titleSuffix: 'not on a .gov domain',
        failLabel: 'Not on .gov',
        passLabel: 'On .gov',
        // Used in sentences: "1,093 of 2,435 fully scanned county sites are not on a .gov domain."
        failPhrase: 'are not on a .gov domain',
        breakdown: {
            title: 'What these sites use instead of .gov',
            label: d => {
                const parts = domainKey(d).toLowerCase().split('.');
                const tld = parts[parts.length - 1];
                // state.us domains ("co.marion.tx.us") read better with the state kept
                if (tld === 'us' && parts.length >= 3 && parts[parts.length - 2].length === 2) return `.${parts[parts.length - 2]}.us`;
                return `.${tld}`;
            },
        },
    },
];

export const GROUPS = [
    {
        key: 'counties',
        label: 'Counties',
        singular: 'county',
        // "County websites", "county sites"
        titleNoun: 'County websites',
        noun: 'county sites',
        hub: '/rankings/counties/',
        filter: isCounty,
        hasCountyMap: true,
    },
];

export function issueUrl(issue, group) {
    return `/issues/${issue.slug}/${group.key}/`;
}

function verdictOf(d, issue) {
    const results = d[issue.topic];
    if (!results || !(issue.check in results)) return 'untested';
    return results[issue.check] === false ? 'fail' : 'pass';
}

// A list copy of a site record for the page's table and map tooltips.
function siteRow(d, issue, stateNames) {
    const code = stateCodeOf(d);
    const scores = {};
    for (const topic of TOPICS) scores[topic] = scoreOf(d, topic);
    return {
        urlkey: domainKey(d),
        name: d.name || domainKey(d),
        title: d.title || '',
        stateCode: code,
        stateName: code && stateNames[code] ? stateNames[code].name : null,
        stateSlug: code && stateNames[code] ? stateNames[code].slug : null,
        href: `/profile/${slugify(domainKey(d))}/details/?attr=${issue.topic}`,
        overall: scoreOf(d, 'overall'),
        score: scoreOf(d, issue.topic),
        scores,
    };
}

// National county map: failing counties as individual paths (linked, with
// tooltips); every other category as one merged path so the page stays
// light. Boundaries are in one shared plane (countyGeo.usStates.viewBox).
function buildNationalMap(members, verdicts, geo, issue) {
    if (!geo || !geo.usStates || !geo.states) return null;
    const { byFips, unjoined } = joinCounties(members, geo);
    const failing = [];
    const merged = { pass: [], untested: [], unscanned: [], unlisted: [] };
    let joinedFailing = 0;
    for (const [code, stateGeo] of Object.entries(geo.states)) {
        for (const [fips, c] of Object.entries(stateGeo.counties)) {
            const d = byFips.get(`${code}:${fips}`);
            if (!d) {
                merged.unlisted.push(c.d);
                continue;
            }
            const v = verdicts.get(domainKey(d));
            if (v === 'fail') {
                joinedFailing++;
                failing.push({ fips, d: c.d, name: d.name, urlkey: domainKey(d), href: `/profile/${slugify(domainKey(d))}/details/?attr=${issue.topic}` });
            } else if (v === 'pass') {
                merged.pass.push(c.d);
            } else if (v === 'untested') {
                merged.untested.push(c.d);
            } else {
                merged.unscanned.push(c.d);
            }
        }
    }
    const outlines = Object.values(geo.usStates.outlines || {}).join('');
    return {
        viewBox: geo.usStates.viewBox,
        outlines,
        failing,
        passPath: merged.pass.join(''),
        untestedPath: merged.untested.join(''),
        unscannedPath: merged.unscanned.join(''),
        unlistedPath: merged.unlisted.join(''),
        counts: { fail: failing.length, pass: merged.pass.length, untested: merged.untested.length, unscanned: merged.unscanned.length, unlisted: merged.unlisted.length },
        unjoinedCount: unjoined.length,
        unjoinedFailingCount: [...verdicts.entries()].filter(([, v]) => v === 'fail').length - joinedFailing,
    };
}

export function buildIssuePage(issue, group, records, audits, stateNames, geo) {
    const attr = attributeIndex(audits)[issue.topic].get(issue.check) || {};
    const topicInfo = audits[issue.topic] || {};
    const members = records.filter(group.filter);
    const responding = members.filter(isResponding);
    const scored = members.filter(isScored);

    const verdicts = new Map();
    for (const d of scored) verdicts.set(domainKey(d), verdictOf(d, issue));
    const failingRecords = scored.filter(d => verdicts.get(domainKey(d)) === 'fail');
    const passCount = scored.filter(d => verdicts.get(domainKey(d)) === 'pass').length;
    const untestedCount = scored.length - failingRecords.length - passCount;
    const testedCount = scored.length - untestedCount;

    // Sites failing, by state then name, for the table.
    const failing = failingRecords.map(d => siteRow(d, issue, stateNames));
    failing.sort((a, b) => (a.stateName || '').localeCompare(b.stateName || '') || a.name.localeCompare(b.name));

    // Per-state shares. Share is failing / tested in that state.
    const stateMap = new Map();
    for (const d of scored) {
        const code = stateCodeOf(d);
        if (!code || !stateNames[code]) continue;
        if (!stateMap.has(code)) stateMap.set(code, { code, name: stateNames[code].name, slug: stateNames[code].slug, scored: 0, tested: 0, failing: 0 });
        const s = stateMap.get(code);
        s.scored++;
        const v = verdicts.get(domainKey(d));
        if (v !== 'untested') s.tested++;
        if (v === 'fail') s.failing++;
    }
    const states = [...stateMap.values()].map(s => ({
        ...s,
        share: s.tested ? s.failing / s.tested : 0,
        href: `${group.hub}${s.slug}/${issue.topic}/`,
    }));
    states.sort((a, b) => b.share - a.share || b.failing - a.failing || a.name.localeCompare(b.name));
    const statesAffected = states.filter(s => s.failing > 0).length;
    // Only states with enough sites for a share to mean something lead the copy.
    const MIN_STATE_SITES = 10;
    const ranked = states.filter(s => s.tested >= MIN_STATE_SITES);
    const highestState = ranked[0] || null;
    const lowestState = ranked.length ? ranked[ranked.length - 1] : null;

    // Optional breakdown of the failing sites, largest bucket first.
    let breakdown = null;
    if (issue.breakdown) {
        const counts = new Map();
        for (const d of failingRecords) {
            const label = issue.breakdown.label(d);
            counts.set(label, (counts.get(label) || 0) + 1);
        }
        const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        const TOP = 8;
        const top = rows.slice(0, TOP);
        const rest = rows.slice(TOP).reduce((n, [, c]) => n + c, 0);
        if (rest) top.push(['Other', rest]);
        breakdown = {
            id: `issue-${issue.slug}-${group.key}-breakdown`,
            type: 'bar',
            title: issue.breakdown.title,
            subtitle: `Number of the ${formatCount(failing.length)} fully scanned ${group.noun} that ${issue.failPhrase}, by domain ending.`,
            headingLevel: 2,
            valueFormat: 'count',
            labelHeader: 'Domain ending',
            valueHeader: 'Sites',
            rows: top.map(([label, value]) => ({ key: slugify(label) || 'other', label, value })),
        };
    }

    const map = group.hasCountyMap ? buildNationalMap(members, verdicts, geo, issue) : null;

    return {
        issue: { slug: issue.slug, topic: issue.topic, check: issue.check, titleSuffix: issue.titleSuffix, failLabel: issue.failLabel, passLabel: issue.passLabel, failPhrase: issue.failPhrase },
        group: { key: group.key, label: group.label, singular: group.singular, titleNoun: group.titleNoun, noun: group.noun, hub: group.hub },
        url: issueUrl(issue, group),
        title: `${group.titleNoun} ${issue.titleSuffix}`,
        // Social unfurl image, rendered by scripts/og-issue-map.js when the page has a map.
        ogImage: group.hasCountyMap ? `issue-${issue.slug}-${group.key}-og.png` : null,
        check: {
            key: attr.key || issue.check,
            label: attr.displayName || issue.check,
            description: attr.description || '',
            why: attr.why || '',
            risk: attr.risk || '',
            error: attr.error || '',
            standardsUrl: `https://standards.scangov.org/${attr.key || issue.check}`,
            guidance: attr.guidance || [],
            topicLabel: topicInfo.displayName || issue.topic,
            topicIcon: topicInfo.icon || '',
            topicUrl: topicInfo.url || '',
        },
        count: members.length,
        respondingCount: responding.length,
        partialCount: responding.length - scored.length,
        scoredCount: scored.length,
        testedCount,
        untestedCount,
        failCount: failing.length,
        passCount,
        share: testedCount ? failing.length / testedCount : 0,
        scanWindow: scanWindow(members),
        failing,
        states,
        statesAffected,
        highestState,
        lowestState,
        minStateSites: MIN_STATE_SITES,
        breakdown,
        map,
    };
}

export function buildIssuePages(records, audits, stateNames, geo) {
    const pages = [];
    for (const issue of ISSUES) {
        for (const group of GROUPS) {
            pages.push(buildIssuePage(issue, group, records, audits, stateNames, geo));
        }
    }
    return pages;
}
