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

import { isCounty, stateCodeOf, isResponding, scoreOf, domainKey } from './counties.js';
import { topicKeysFrom } from './topics.js';
import { isScored, attributeIndex, scanWindow } from './group-summary.js';
import { joinCounties } from './county-geo.js';
import { slugify, formatCount } from './charts/format.js';

// ARI scores map to U.S. school grades (9.2 reads as 9th grade). Failing
// sites start at 8.5, which rounds to 9th; 13 and up is college, 17 and up
// is graduate school.
export function gradeLevelOf(ari) {
    if (!Number.isFinite(ari)) return 'No score';
    const grade = Math.round(ari);
    if (grade >= 17) return 'Graduate school';
    if (grade >= 13) return 'College';
    if (grade >= 12) return '12th grade';
    if (grade >= 11) return '11th grade';
    if (grade >= 10) return '10th grade';
    if (grade >= 9) return '9th grade';
    return '8th grade or below';
}

// One entry per page. `slug` is the URL segment and `topic` names the
// indicator. A page is either one check (`check`: the key on the record) or
// one feature made of several checks (`checks`: the keys, plus `verdict(d)`,
// which returns { verdict: 'fail' | 'pass' | 'untested', stage, mark } for a
// fully scanned record; `stage` names what is wrong for the breakdown chart,
// and `mark` flags a passing site the map should still show in its own
// color, named by `mark.label`, without counting it as a problem; `stages`,
// when given, colors the map's failing counties by stage, 'severe' tone or
// the default issue tone). The
// labels feed titles, legends and table headers (`failPhraseSingular` is the
// one-site form of `failPhrase`). A single-check page may also give a
// `verdict` function and a `note` (shown with the check's description) when
// a missing result means something other than "not tested", plus `lead`
// (sentences for the intro) and `why` (replaces the standard's "why" copy).
// `breakdown` (optional)
// buckets the failing sites for a bar chart: label(d, stage) names a bucket,
// and `order` (optional) lists the buckets in display order for an ordinal
// scale; without it the largest bucket comes first. `unlisted: true` builds
// the page but keeps it off the issues index, the hubs, Pulse, the sitemap,
// and search engines, for a page whose data is still being checked.
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
        failPhraseSingular: 'is not on a .gov domain',
        breakdown: {
            title: 'What these sites use instead of .gov',
            subtitle: 'by domain ending',
            labelHeader: 'Domain ending',
            label: d => {
                const parts = domainKey(d).toLowerCase().split('.');
                const tld = parts[parts.length - 1];
                // state.us domains ("co.marion.tx.us") read better with the state kept
                if (tld === 'us' && parts.length >= 3 && parts[parts.length - 2].length === 2) return `.${parts[parts.length - 2]}.us`;
                return `.${tld}`;
            },
        },
    },
    {
        slug: 'sitemap',
        topic: 'botability',
        // Feature page: three checks, one verdict. A site fails when its
        // sitemap does not load, is not XML, or is not listed in robots.txt.
        // sitemap-robots is absent from a record only when the site has no
        // robots.txt file (robotsFile.present is false), so a working sitemap
        // with no robots.txt counts as passing here; the robots.txt feature
        // page is where that gap belongs.
        checks: ['status', 'xml', 'sitemap-robots'],
        feature: {
            label: 'Sitemap',
            description: 'A sitemap is an XML file that lists the pages on a site. Search engines and AI agents read it to find pages they would otherwise miss, and robots.txt is where they look for its address.',
            note: 'A site with a working sitemap and no robots.txt file counts as passing here, since there is no file to list the sitemap in.',
        },
        verdict: d => {
            const b = d.botability || {};
            if (!('status' in b)) return { verdict: 'untested' };
            if (b.status === false) return { verdict: 'fail', stage: 'No working sitemap' };
            if (b.xml === false) return { verdict: 'fail', stage: 'Sitemap is not valid XML' };
            if (b['sitemap-robots'] === false) return { verdict: 'fail', stage: 'Sitemap not listed in robots.txt' };
            return { verdict: 'pass' };
        },
        // "County websites with sitemap problems"
        titleSuffix: 'with sitemap problems',
        failLabel: 'Sitemap problem',
        passLabel: 'Sitemap works',
        // "1,082 of 2,400 fully scanned county sites have a sitemap problem."
        failPhrase: 'have a sitemap problem',
        failPhraseSingular: 'has a sitemap problem',
        breakdown: {
            title: 'What is wrong with the sitemap',
            subtitle: 'by problem',
            labelHeader: 'Problem',
            label: (d, stage) => stage,
        },
    },
    {
        slug: 'robots',
        topic: 'botability',
        // Feature page for the robots.txt file. The auditor records the fetch
        // in `robotsFile` (present, fetchStatus, statusCode, valid, errors) and
        // leaves `valid` and `sitemap-robots` off a record when there is no
        // file. A missing file is not a failing check (a site without one is
        // crawlable), so it counts as passing here, but it is interesting, so
        // those sites are marked on the map in their own color (`mark`). A
        // fetch error (status null, 403, 500, 429) means we do not know, so
        // it is untested. The sitemap link lives on the sitemap page;
        // `crawlable` is about indexing directives on the page, not this file.
        checks: ['valid', 'allowed'],
        feature: {
            label: 'robots.txt',
            description: 'A robots.txt file tells search engines and AI agents which parts of a site they may crawl and where to find the sitemap. When a site has one, it has to follow the format and not block the whole site.',
            note: 'A site with no robots.txt file passes both checks, since nothing blocks crawling and there is no file to get wrong. Sites whose robots.txt could not be fetched are left out of the share.',
        },
        mark: {
            label: 'No robots.txt file',
            // "Another 711 tested county sites (30%) have no robots.txt file at all."
            phrase: 'have no robots.txt file at all',
        },
        // Map legend order, most severe first; failing counties are colored by
        // stage. Without `stages` a page draws every failing county in one color.
        stages: [
            { label: 'Blocks search engines', tone: 'severe' },
            { label: 'robots.txt has errors' },
        ],
        verdict: d => {
            const b = d.botability || {};
            const rf = d.robotsFile;
            if (rf && rf.present !== true && rf.present !== false) return { verdict: 'untested' };
            if (b.allowed === false) return { verdict: 'fail', stage: 'Blocks search engines' };
            if (rf && rf.present === false) return { verdict: 'pass', mark: 'No robots.txt file' };
            if (b.valid === false) return { verdict: 'fail', stage: 'robots.txt has errors' };
            if (!('valid' in b) && !('allowed' in b)) return { verdict: 'untested' };
            return { verdict: 'pass' };
        },
        // "County websites with robots.txt problems"
        titleSuffix: 'with robots.txt problems',
        failLabel: 'robots.txt problem',
        passLabel: 'robots.txt works',
        // "1,300 of 2,399 fully scanned county sites have a robots.txt problem."
        failPhrase: 'have a robots.txt problem',
        failPhraseSingular: 'has a robots.txt problem',
        breakdown: {
            title: 'What is wrong with robots.txt',
            subtitle: 'by problem',
            labelHeader: 'Problem',
            label: (d, stage) => stage,
        },
    },
    {
        slug: 'needs-javascript',
        topic: 'botability',
        // Single-check page for client-side rendering. Since 2026-10-24 the
        // auditor's lightrunner measures whether the main content is in the
        // initial HTML and records the verdict as botability.text-content;
        // before that the key only marked that the fetch succeeded (see
        // isPartial in counties.js). The check was run on purpose against
        // the sites that looked like they render with JavaScript, so a
        // fully scanned site with no result is one that did not look that
        // way and counts as passing here (user decision 2026-10-25), not as
        // untested. The per-site measurement (contentInfo) is not in the
        // homepages payload, so there is no breakdown chart yet.
        check: 'text-content',
        verdict: d => ({ verdict: (d.botability || {})['text-content'] === false ? 'fail' : 'pass' }),
        note: 'We ran it only on sites that looked like they use JavaScript to show content. A site with no result counts as passing.',
        // The two points this page exists to make, in the lead and in "Why it matters".
        lead: 'Pages built this way load slowly. The browser has to run the script before it can show anything. The companies behind the biggest AI agents also say they do not index content rendered this way. So these pages stay out of the AI knowledge base.',
        why: 'Client-side rendering is a slow way to deliver a page. The browser has to download and run the script before it can show any content, so the page loads poorly. It also keeps you out of AI answers. The companies behind the biggest AI agents say they do not index content rendered on the client. A page built this way is not part of their knowledge base.',
        // "County websites that need JavaScript to show their content"
        titleSuffix: 'that need JavaScript to show their content',
        failLabel: 'Needs JavaScript',
        passLabel: 'Content in the HTML',
        // "38 of 41 fully scanned county sites need JavaScript to show their main content."
        failPhrase: 'need JavaScript to show their main content',
        failPhraseSingular: 'needs JavaScript to show its main content',
    },
    {
        slug: 'reading-level',
        topic: 'readability',
        // Single-check page on the homepage's reading level. The auditor
        // scores the page text with the Automated Readability Index (top-level
        // `ari`, with `fk` alongside) and records the verdict as
        // readability['reading-level']: pass at 8.5 or below (data on
        // 2026-10-25: highest passing 8.499, lowest failing 8.503). The
        // breakdown reads `ari` directly to show real grade levels. Unlisted
        // until the user is happy with the data: 68 county sites score below
        // ARI 1 and 11 above 20, which look like pages with very little text
        // or with long tokens, and the standard's copy says 7th grade where
        // the threshold sits at 8th.
        check: 'reading-level',
        unlisted: true,
        // "County websites that are hard to read"
        titleSuffix: 'that are hard to read',
        failLabel: 'Above 8th grade',
        passLabel: 'At or below 8th grade',
        // "899 of 2,320 fully scanned county sites read above an 8th grade level."
        failPhrase: 'read above an 8th grade level',
        failPhraseSingular: 'reads above an 8th grade level',
        lead: 'Hard text slows people down. Some give up before they find what they need. We score the text on each homepage with the Automated Readability Index (ARI). It estimates the U.S. school grade a reader needs.',
        note: 'A site passes when its ARI score is 8.5 or lower.',
        why: 'Plain text helps people get what they need the first time. Hard text leads to more calls, more errors, and more visits.',
        breakdown: {
            title: 'How hard the failing sites are to read',
            subtitle: 'by grade level',
            labelHeader: 'Grade level',
            order: ['9th grade', '10th grade', '11th grade', '12th grade', 'College', 'Graduate school'],
            label: d => gradeLevelOf(d.ari),
        },
    },
    {
        slug: 'open-graph',
        topic: 'usability',
        // Feature page for the six Open Graph tags a shared link needs. A site
        // fails when any of them is missing; the breakdown buckets by how many.
        // The image alt text tag (ogimagealt) is left out of the verdict: only
        // 37 county sites set it, so counting it would fail nearly every site
        // that otherwise set Open Graph up. The note says so.
        checks: ['ogtitle', 'ogdescription', 'ogimage', 'ogurl', 'ogtype', 'ogsitename'],
        feature: {
            label: 'Open Graph tags',
            description: 'Open Graph tags tell social networks, chat apps, and search engines which title, description, and image to show when someone shares a link to the page. Without them a shared link shows whatever the platform can guess, often nothing.',
            note: 'The image alt text tag is not counted here: of the sites that set every other tag, most leave it out, so counting it would hide the difference between sites that set up Open Graph and sites that never did.',
        },
        verdict: d => {
            const u = d.usability || {};
            const tags = ['ogtitle', 'ogdescription', 'ogimage', 'ogurl', 'ogtype', 'ogsitename'];
            const tested = tags.filter(k => k in u);
            if (!tested.length) return { verdict: 'untested' };
            const missing = tested.filter(k => u[k] === false).length;
            if (!missing) return { verdict: 'pass' };
            if (missing === tested.length) return { verdict: 'fail', stage: 'No Open Graph tags at all' };
            if (missing >= 4) return { verdict: 'fail', stage: 'Four or five tags missing' };
            return { verdict: 'fail', stage: 'One to three tags missing' };
        },
        // "County websites missing Open Graph tags"
        titleSuffix: 'missing Open Graph tags',
        failLabel: 'Missing tags',
        passLabel: 'All tags set',
        // "1,920 of 2,419 fully scanned county sites are missing Open Graph tags."
        failPhrase: 'are missing Open Graph tags',
        failPhraseSingular: 'is missing Open Graph tags',
        breakdown: {
            title: 'How many of the six tags are missing',
            subtitle: 'by number of missing tags',
            labelHeader: 'Missing tags',
            label: (d, stage) => stage,
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

// { verdict, stage } for a fully scanned record. Feature pages supply their
// own function; single-check pages read the one key.
function verdictOf(d, issue) {
    if (issue.verdict) return issue.verdict(d);
    const results = d[issue.topic];
    if (!results || !(issue.check in results)) return { verdict: 'untested' };
    return { verdict: results[issue.check] === false ? 'fail' : 'pass' };
}

export function issueCheckKeys(issue) {
    return issue.checks || [issue.check];
}

// Copy for one check from audits.json, with formatted-key fallbacks.
function checkCopy(key, attrIndex, topicInfo) {
    const attr = attrIndex.get(key) || {};
    return {
        key: attr.key || key,
        label: attr.displayName || key,
        description: attr.description || '',
        why: attr.why || '',
        risk: attr.risk || '',
        error: attr.error || '',
        standardsUrl: `https://standards.scangov.org/${attr.key || key}`,
        guidance: attr.guidance || [],
        topicLabel: topicInfo.displayName || '',
        topicIcon: topicInfo.icon || '',
        topicUrl: topicInfo.url || '',
    };
}

// A list copy of a site record for the page's table and map tooltips.
function siteRow(d, issue, stateNames, topics) {
    const code = stateCodeOf(d);
    const scores = {};
    for (const topic of topics) scores[topic] = scoreOf(d, topic);
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
function buildNationalMap(members, verdicts, stages, marks, geo, issue) {
    if (!geo || !geo.usStates || !geo.states) return null;
    const { byFips, unjoined } = joinCounties(members, geo);
    const failing = [];
    // One group of linked paths per stage when the issue defines stages
    // (legend order), else one group for every failing county.
    const groupDefs = issue.stages || [{ label: issue.failLabel, tone: 'issue', all: true }];
    const groups = groupDefs.map((g, i) => ({ key: `${i}`, label: g.label, tone: g.tone || 'issue', counties: [] }));
    const groupFor = d => groupDefs[0].all ? groups[0] : groups[groupDefs.findIndex(g => g.label === stages.get(domainKey(d)))] || groups[groups.length - 1];
    const merged = { pass: [], marked: [], untested: [], unscanned: [], unlisted: [] };
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
                const county = { fips, d: c.d, name: d.name, urlkey: domainKey(d), href: `/profile/${slugify(domainKey(d))}/details/?attr=${issue.topic}` };
                failing.push(county);
                groupFor(d).counties.push(county);
            } else if (v === 'pass') {
                (marks.has(domainKey(d)) ? merged.marked : merged.pass).push(c.d);
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
        groups,
        passPath: merged.pass.join(''),
        markedPath: merged.marked.join(''),
        untestedPath: merged.untested.join(''),
        unscannedPath: merged.unscanned.join(''),
        unlistedPath: merged.unlisted.join(''),
        counts: { fail: failing.length, pass: merged.pass.length, marked: merged.marked.length, untested: merged.untested.length, unscanned: merged.unscanned.length, unlisted: merged.unlisted.length },
        unjoinedCount: unjoined.length,
        unjoinedFailingCount: [...verdicts.entries()].filter(([, v]) => v === 'fail').length - joinedFailing,
    };
}

export function buildIssuePage(issue, group, records, audits, stateNames, geo) {
    const attrIndex = attributeIndex(audits)[issue.topic];
    const topicInfo = audits[issue.topic] || { displayName: issue.topic };
    const checks = issueCheckKeys(issue).map(key => checkCopy(key, attrIndex, topicInfo));
    // The page's headline check: the feature's own copy, or the one check.
    const check = issue.feature
        ? { ...checks[0], key: issue.slug, label: issue.feature.label, description: issue.feature.description, note: issue.feature.note || '', why: '', risk: '', error: '', standardsUrl: `https://standards.scangov.org${topicInfo.url || ''}`, guidance: [] }
        : { ...checks[0], note: issue.note || '', lead: issue.lead || '', why: issue.why || checks[0].why };
    const members = records.filter(group.filter);
    const responding = members.filter(isResponding);
    const scored = members.filter(isScored);

    const verdicts = new Map();
    const stages = new Map();
    const marks = new Map();
    for (const d of scored) {
        const { verdict, stage, mark } = verdictOf(d, issue);
        verdicts.set(domainKey(d), verdict);
        if (stage) stages.set(domainKey(d), stage);
        if (mark && verdict === 'pass') marks.set(domainKey(d), mark);
    }
    const failingRecords = scored.filter(d => verdicts.get(domainKey(d)) === 'fail');
    const passCount = scored.filter(d => verdicts.get(domainKey(d)) === 'pass').length;
    const untestedCount = scored.length - failingRecords.length - passCount;
    const testedCount = scored.length - untestedCount;

    // Sites failing, by state then name, for the table.
    const topics = topicKeysFrom(audits);
    const failing = failingRecords.map(d => siteRow(d, issue, stateNames, topics));
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
            const label = issue.breakdown.label(d, stages.get(domainKey(d)));
            counts.set(label, (counts.get(label) || 0) + 1);
        }
        const order = issue.breakdown.order;
        const rows = [...counts.entries()].sort(order
            ? (a, b) => (order.indexOf(a[0]) + 1 || Infinity) - (order.indexOf(b[0]) + 1 || Infinity) || b[1] - a[1]
            : (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        const TOP = 8;
        const top = rows.slice(0, TOP);
        const rest = rows.slice(TOP).reduce((n, [, c]) => n + c, 0);
        if (rest) top.push(['Other', rest]);
        breakdown = {
            id: `issue-${issue.slug}-${group.key}-breakdown`,
            type: 'bar',
            title: issue.breakdown.title,
            subtitle: `The ${formatCount(failing.length)} ${group.noun} that ${issue.failPhrase}, grouped ${issue.breakdown.subtitle || 'by type'}.`,
            headingLevel: 2,
            valueFormat: 'count',
            labelHeader: issue.breakdown.labelHeader || 'Group',
            valueHeader: 'Sites',
            rows: top.map(([label, value]) => ({ key: slugify(label) || 'other', label, value })),
        };
    }

    const map = group.hasCountyMap ? buildNationalMap(members, verdicts, stages, marks, geo, issue) : null;

    return {
        unlisted: !!issue.unlisted,
        issue: { slug: issue.slug, topic: issue.topic, check: issue.check || null, isFeature: !!issue.feature, titleSuffix: issue.titleSuffix, failLabel: issue.failLabel, passLabel: issue.passLabel, failPhrase: issue.failPhrase, failPhraseSingular: issue.failPhraseSingular || issue.failPhrase },
        group: { key: group.key, label: group.label, singular: group.singular, titleNoun: group.titleNoun, noun: group.noun, hub: group.hub },
        url: issueUrl(issue, group),
        title: `${group.titleNoun} ${issue.titleSuffix}`,
        // Social unfurl image, rendered by scripts/og-issue-map.js when the page has a map.
        ogImage: group.hasCountyMap ? `issue-${issue.slug}-${group.key}-og.png` : null,
        // Headline copy (the feature, or the one check) and every check behind the verdict.
        check,
        checks,
        count: members.length,
        respondingCount: responding.length,
        partialCount: responding.length - scored.length,
        scoredCount: scored.length,
        testedCount,
        untestedCount,
        failCount: failing.length,
        passCount,
        // Passing sites the map marks anyway (issue.mark), e.g. no robots.txt file.
        mark: issue.mark ? { label: issue.mark.label, phrase: issue.mark.phrase } : null,
        markCount: marks.size,
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
