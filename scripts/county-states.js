// Per-state county data for /rankings/counties/{st}/ and its topic pages.
//
// buildCountyStates(domains, stateNames, audits) groups county records by
// state and computes, per state and nationally: rankings, averages, grade
// distributions, score histograms, the most-failed checks, and prebuilt chart
// specs. Everything is derived from copies; the shared domain objects are
// never written to (addRankingPosition in _data/variables.js mutates them,
// so their rankingPosition depends on data-file load order and is not read).
//
// Populations, stated once here and repeated in every label:
//   scanned        every county on the list (count)
//   responding     status 200 and scored (respondingCount)
//   partial        responding sites that did not return page content, so the
//                  content checks were never scored (partialCount, see
//                  isPartial); listed in tables without scores, excluded from
//                  every average, distribution, share and rank
//   fully scanned  responding and not partial (scoredCount); the population
//                  behind every figure on the page

import {
    TOPICS, isCounty, stateCodeOf, isResponding, scoreOf, isPartial,
    rankDense, gradeOf, mean, domainKey,
} from './counties.js';
import { slugify } from './charts/format.js';
import {
    gradeDistributionSpec, topicAveragesSpec, topFailuresSpec, histogramSpec, areaSpec,
} from './charts/specs.js';

const ALL_TOPICS = ['overall', ...TOPICS];
const TOP_FAILURES = 5;
const TOP_SITES = 3;

const isScored = d => isResponding(d) && !isPartial(d);

function emptyDistribution() {
    return { A: 0, B: 0, C: 0, D: 0, F: 0 };
}

function emptyBins() {
    const bins = [];
    for (let i = 0; i < 10; i++) bins.push({ from: i * 10, to: i === 9 ? 100 : i * 10 + 9, count: 0 });
    return bins;
}

function binIndex(score) {
    return Math.min(9, Math.max(0, Math.floor(score / 10)));
}

function profileHref(d) {
    return `/profile/${slugify(domainKey(d))}/overall/`;
}

// Lookup from an attribute key or scorekey to its audits.json entry.
function attributeIndex(audits) {
    const index = {};
    for (const topic of TOPICS) {
        index[topic] = new Map();
        for (const attr of (audits[topic] && audits[topic].attributes) || []) {
            if (attr.key) index[topic].set(attr.key, attr);
            if (attr.scorekey) index[topic].set(attr.scorekey, attr);
        }
    }
    return index;
}

function topicLabel(audits, topic) {
    return (audits[topic] && audits[topic].displayName) || topic[0].toUpperCase() + topic.slice(1);
}

// Aggregates over one list of responding records.
function summarize(responding, attrIndex) {
    const averages = {};
    const gradeDistribution = {};
    const histogram = {};
    for (const topic of ALL_TOPICS) {
        const scores = responding.map(d => scoreOf(d, topic)).filter(Number.isFinite);
        averages[topic] = mean(scores);
        const dist = emptyDistribution();
        const bins = emptyBins();
        for (const s of scores) {
            dist[gradeOf(s)]++;
            bins[binIndex(s)].count++;
        }
        gradeDistribution[topic] = dist;
        histogram[topic] = bins;
    }

    const topFailures = {};
    for (const topic of TOPICS) {
        const counts = new Map();
        for (const d of responding) {
            const results = d[topic];
            if (!results) continue;
            for (const [key, passed] of Object.entries(results)) {
                if (passed === false) counts.set(key, (counts.get(key) || 0) + 1);
            }
        }
        const list = [];
        for (const [key, failCount] of counts) {
            const attr = attrIndex[topic].get(key) || {};
            list.push({
                key,
                label: attr.displayName || key.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
                standardsUrl: `https://standards.scangov.org/${attr.key || key}`,
                description: attr.description || '',
                why: attr.why || '',
                risk: attr.risk || '',
                impact: attr.impact || 0,
                failCount,
                share: responding.length ? failCount / responding.length : 0,
            });
        }
        list.sort((a, b) => b.failCount - a.failCount || b.impact - a.impact || a.label.localeCompare(b.label));
        topFailures[topic] = list.slice(0, TOP_FAILURES);
    }

    return { averages, gradeDistribution, histogram, topFailures };
}

// Copies of a state's records sorted for one topic: fully scanned sites by
// score, then partial scans, then non-responding sites, each group by name.
// Partial and non-responding copies carry no score, grade or rank.
// rankingPosition is the in-state rank so the shared ranking table include
// renders it unchanged.
function rankedCopies(records, topic, nationalRanks) {
    const scored = records.filter(isScored);
    const stateRanks = rankDense(scored, d => scoreOf(d, topic));
    const copies = records.map(d => {
        const key = domainKey(d);
        const full = isScored(d);
        const score = full ? scoreOf(d, topic) : null;
        return {
            ...d,
            partial: isResponding(d) && isPartial(d),
            score,
            grade: Number.isFinite(score) ? gradeOf(score) : null,
            rankingPosition: full ? stateRanks.get(key) ?? null : null,
            nationalRank: full ? nationalRanks.get(key) ?? null : null,
        };
    });
    const group = d => (Number.isFinite(d.score) ? 2 : d.partial ? 1 : 0);
    copies.sort((a, b) => group(b) - group(a) || (b.score ?? 0) - (a.score ?? 0) || (a.name || '').localeCompare(b.name || ''));
    return copies;
}

function buildCharts(state, national, audits) {
    const idBase = `county-${state.slug}`;
    const respondingText = `${state.scoredCount} fully scanned ${state.name} county sites`;
    const topicHref = topic => `/rankings/counties/${state.slug}/${topic}/`;
    const charts = { failures: {}, histogram: {}, area: {}, grades: {} };

    for (const topic of ALL_TOPICS) {
        const label = topic === 'overall' ? 'overall' : topicLabel(audits, topic).toLowerCase();
        charts.grades[topic] = gradeDistributionSpec({
            id: `${idBase}-grades-${topic}`,
            title: `${state.name} counties by ${label} grade, compared with all U.S. counties`,
            subtitle: `Share of fully scanned sites in each grade band. ${state.name}: ${state.scoredCount} sites. U.S.: ${national.scoredCount} sites.`,
            groups: [
                { key: state.code, label: state.name, distribution: state.gradeDistribution[topic], total: state.scoredCount },
                { key: 'US', label: 'All U.S. counties', href: '/rankings/counties/', distribution: national.gradeDistribution[topic], total: national.scoredCount },
            ],
        });
        charts.histogram[topic] = histogramSpec({
            id: `${idBase}-hist-${topic}`,
            title: `${state.name} counties by ${label} score`,
            subtitle: `Number of the ${respondingText} in each 10-point score range`,
            bins: state.histogram[topic],
        });
        const points = state.byTopic[topic].filter(d => Number.isFinite(d.score)).map(d => ({ label: d.name, value: d.score }));
        const markers = [
            { label: `${state.name} average`, value: state.averages[topic] },
            { label: 'U.S. county average', value: national.averages[topic] },
        ];
        charts.area[topic] = areaSpec({
            id: `${idBase}-area-${topic}`,
            title: `How ${state.name} county ${label} scores are distributed`,
            subtitle: `Smoothed distribution of the ${respondingText}, score 0 to 100. Height shows how many sites score near each value.`,
            points, bins: state.histogram[topic], markers,
        });
    }

    for (const topic of TOPICS) {
        const label = topicLabel(audits, topic).toLowerCase();
        charts.failures[topic] = topFailuresSpec({
            id: `${idBase}-fails-${topic}`,
            title: `Most common ${label} failures among ${state.name} county sites`,
            subtitle: `Share of the ${respondingText} failing each check. A site can fail more than one check. Each check links to its standard and how to fix it.`,
            headingLevel: 2,
            failures: state.topFailures[topic],
            respondingCount: state.scoredCount,
        });
    }

    charts.topics = topicAveragesSpec({
        id: `${idBase}-topics`,
        title: `${state.name} county average score by indicator, compared with all U.S. counties`,
        subtitle: `Average of the ${respondingText}, score 0 to 100. U.S. average covers ${national.scoredCount} fully scanned county sites.`,
        topics: TOPICS.map(t => ({ key: t, label: topicLabel(audits, t) })),
        averages: state.averages, benchmarks: national.averages,
        seriesLabel: state.name, benchmarkLabel: 'U.S. counties',
        hrefFor: topicHref,
    });

    return charts;
}

// Map data for one state: every county path in the state, joined to the
// scanned site where one exists, with the score per topic so the include can
// color by whichever topic the page shows. Counties with no site stay unjoined.
function buildMap(code, records, geo) {
    const stateGeo = geo && geo.states && geo.states[code];
    if (!stateGeo) return null;
    const byFips = new Map();
    let joined = 0;
    for (const d of records) {
        const fips = geo.byDomain[domainKey(d).toLowerCase()];
        if (fips && stateGeo.counties[fips]) {
            byFips.set(fips, d);
            joined++;
        }
    }
    const counties = Object.entries(stateGeo.counties).map(([fips, c]) => {
        const d = byFips.get(fips);
        if (!d) return { fips, d: c.d, name: c.name || null };
        const responding = isResponding(d);
        const partial = responding && isPartial(d);
        const scores = {};
        for (const topic of ALL_TOPICS) scores[topic] = responding && !partial ? scoreOf(d, topic) : -1;
        return { fips, d: c.d, name: d.name, urlkey: domainKey(d), status: d.status, responding, partial, scores };
    });
    return {
        viewBox: stateGeo.viewBox,
        outline: stateGeo.outline,
        counties,
        joinedCount: joined,
        unjoinedCount: records.length - joined,
        // Legend entries render only for categories present on this map.
        hasNoResponse: counties.some(c => c.urlkey && !c.responding),
        hasPartial: counties.some(c => c.partial),
        hasUnscanned: counties.some(c => !c.urlkey),
    };
}

// Earliest and latest scan time among a state's records, for the footnote.
function scanWindow(records) {
    const times = records.map(d => d.time).filter(Number.isFinite);
    if (!times.length) return null;
    return { from: Math.min(...times), to: Math.max(...times) };
}

export function buildCountyStates(domains, stateNames, audits = {}, geo = null) {
    const attrIndex = attributeIndex(audits);
    const counties = domains.filter(isCounty);
    const responding = counties.filter(isResponding);
    const scored = counties.filter(isScored);

    const nationalRanks = {};
    for (const topic of ALL_TOPICS) nationalRanks[topic] = rankDense(scored, d => scoreOf(d, topic));

    const national = {
        count: counties.length,
        respondingCount: responding.length,
        partialCount: responding.length - scored.length,
        scoredCount: scored.length,
        scanWindow: scanWindow(counties),
        ...summarize(scored, attrIndex),
    };

    const byState = new Map();
    const unplaced = [];
    for (const d of counties) {
        const code = stateCodeOf(d);
        if (!code || !stateNames[code]) {
            unplaced.push(d.name || domainKey(d));
            continue;
        }
        if (!byState.has(code)) byState.set(code, []);
        byState.get(code).push(d);
    }
    if (unplaced.length) console.warn(`county-states: ${unplaced.length} county records have no state: ${unplaced.slice(0, 5).join('; ')}`);

    const states = [];
    for (const [code, records] of byState) {
        const info = stateNames[code];
        const stateResponding = records.filter(isResponding);
        const stateScored = records.filter(isScored);
        const byTopic = {};
        for (const topic of ALL_TOPICS) byTopic[topic] = rankedCopies(records, topic, nationalRanks[topic]);
        const top3 = {};
        for (const topic of ALL_TOPICS) top3[topic] = byTopic[topic].filter(d => Number.isFinite(d.score)).slice(0, TOP_SITES);
        states.push({
            code,
            slug: info.slug,
            name: info.name,
            count: records.length,
            respondingCount: stateResponding.length,
            partialCount: stateResponding.length - stateScored.length,
            scoredCount: stateScored.length,
            scanWindow: scanWindow(records),
            notResponding: records.filter(d => !isResponding(d)).map(d => ({ urlkey: domainKey(d), name: d.name, status: d.status })),
            counties: byTopic.overall,
            byTopic,
            top3,
            map: buildMap(code, records, geo),
            ...summarize(stateScored, attrIndex),
        });
    }
    const unjoined = states.reduce((n, s) => n + (s.map ? s.map.unjoinedCount : 0), 0);
    if (geo && unjoined) console.warn(`county-states: ${unjoined} scanned counties have no map geometry (rerun county-viz/build/export_county_geo.py if the county list changed)`);
    states.sort((a, b) => a.name.localeCompare(b.name));

    // Rank states against each other on each average; states with no
    // responding sites are unranked.
    const ranked = states.filter(s => s.scoredCount > 0);
    const stateRanks = {};
    for (const topic of ALL_TOPICS) {
        const sorted = [...ranked].sort((a, b) => b.averages[topic] - a.averages[topic]);
        let rank = 0, prev = null;
        stateRanks[topic] = new Map();
        for (const s of sorted) {
            if (s.averages[topic] !== prev) { rank++; prev = s.averages[topic]; }
            stateRanks[topic].set(s.code, rank);
        }
    }
    states.forEach((s, i) => {
        s.index = i;
        s.stateCount = ranked.length;
        s.stateRank = {};
        for (const topic of ALL_TOPICS) s.stateRank[topic] = stateRanks[topic].get(s.code) ?? null;
        s.national = national;
        s.charts = s.scoredCount ? buildCharts(s, national, audits) : null;
        s.prev = i > 0 ? { name: states[i - 1].name, slug: states[i - 1].slug } : null;
        s.next = i < states.length - 1 ? { name: states[i + 1].name, slug: states[i + 1].slug } : null;
    });

    return { states, national };
}

// Memoized on the domain list identity so countyStates.js and
// countyStateTopics.js share one build per Eleventy run.
let memo = null;
export function countyStatesFor(domains, stateNames, audits, geo) {
    const key = `${domains.length}:${domains.length ? domainKey(domains[0]) : ''}:${domains.length ? domainKey(domains[domains.length - 1]) : ''}`;
    if (!memo || memo.key !== key) memo = { key, value: buildCountyStates(domains, stateNames, audits, geo) };
    return memo.value;
}
