// Aggregates and chart specs for a group of sites (all counties, all state
// sites, ...). Shared by scripts/county-states.js (national county figures)
// and the group hub data files such as _data/stateSummary.js.
//
// Populations: `records` is every site in the group; a site is fully scanned
// (scored) when it responded and returned page content (see isScored). Every
// average, distribution, share and rank uses fully scanned sites only.

import { TOPICS, isResponding, isPartial, scoreOf, gradeOf, mean } from './counties.js';
import { gradeDistributionSpec, topFailuresSpec, areaSpec } from './charts/specs.js';

export const ALL_TOPICS = ['overall', ...TOPICS];
export const TOP_FAILURES = 5;

export const isScored = d => isResponding(d) && !isPartial(d);

export function emptyDistribution() {
    return { A: 0, B: 0, C: 0, D: 0, F: 0 };
}

export function emptyBins() {
    const bins = [];
    for (let i = 0; i < 10; i++) bins.push({ from: i * 10, to: i === 9 ? 100 : i * 10 + 9, count: 0 });
    return bins;
}

export function binIndex(score) {
    return Math.min(9, Math.max(0, Math.floor(score / 10)));
}

// Lookup from an attribute key or scorekey to its audits.json entry.
export function attributeIndex(audits) {
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

export function topicLabel(audits, topic) {
    return (audits[topic] && audits[topic].displayName) || topic[0].toUpperCase() + topic.slice(1);
}

// Earliest and latest scan time among a set of records.
export function scanWindow(records) {
    const times = records.map(d => d.time).filter(Number.isFinite);
    if (!times.length) return null;
    return { from: Math.min(...times), to: Math.max(...times) };
}

// Averages, grade distribution, histogram and most-failed checks over one
// list of fully scanned records.
export function summarize(scored, attrIndex) {
    const averages = {};
    const gradeDistribution = {};
    const histogram = {};
    for (const topic of ALL_TOPICS) {
        const scores = scored.map(d => scoreOf(d, topic)).filter(Number.isFinite);
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
        for (const d of scored) {
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
                share: scored.length ? failCount / scored.length : 0,
            });
        }
        list.sort((a, b) => b.failCount - a.failCount || b.impact - a.impact || a.label.localeCompare(b.label));
        topFailures[topic] = list.slice(0, TOP_FAILURES);
    }

    return { averages, gradeDistribution, histogram, topFailures };
}

// Chart specs for a group hub: distribution curve, grade split, and the
// most-failed checks per indicator. `groupText` names the population in
// subtitles, e.g. "fully scanned U.S. county sites"; `groupTitle` names it
// in titles, e.g. "U.S. county".
export function buildGroupCharts(summary, scored, audits, { idBase, groupTitle, groupText }) {
    const respondingText = `${summary.scoredCount} ${groupText}`;
    const charts = { failures: {}, area: {}, grades: {} };
    for (const topic of ALL_TOPICS) {
        const label = topic === 'overall' ? 'overall' : topicLabel(audits, topic).toLowerCase();
        const points = scored.map(d => ({ label: d.name, value: scoreOf(d, topic) })).filter(p => Number.isFinite(p.value));
        charts.area[topic] = areaSpec({
            id: `${idBase}-area-${topic}`,
            title: `How ${groupTitle} ${label} scores are distributed`,
            subtitle: `Smoothed distribution of the ${respondingText}, score 0 to 100. Height shows how many sites score near each value.`,
            points, bins: summary.histogram[topic],
            markers: [{ label: 'Average', value: summary.averages[topic] }],
        });
        charts.grades[topic] = gradeDistributionSpec({
            id: `${idBase}-grades-${topic}`,
            title: `${groupTitle} sites by ${label} grade`,
            subtitle: `Share of the ${respondingText} in each grade band`,
            groups: [{ key: idBase, label: `All ${groupText.replace(/^fully scanned /, '')}`, distribution: summary.gradeDistribution[topic], total: summary.scoredCount }],
        });
    }
    for (const topic of TOPICS) {
        const label = topicLabel(audits, topic).toLowerCase();
        charts.failures[topic] = topFailuresSpec({
            id: `${idBase}-fails-${topic}`,
            title: `Most common ${label} failures among ${groupTitle} sites`,
            subtitle: `Share of the ${respondingText} failing each check. A site can fail more than one check. Each check links to its standard and how to fix it.`,
            headingLevel: 2,
            failures: summary.topFailures[topic],
            respondingCount: summary.scoredCount,
        });
    }
    return charts;
}

// Everything a group hub page needs, from the group's records.
export function buildGroupSummary(records, audits, { idBase, groupTitle, groupText }) {
    const attrIndex = attributeIndex(audits);
    const responding = records.filter(isResponding);
    const scored = records.filter(isScored);
    const summary = {
        count: records.length,
        respondingCount: responding.length,
        partialCount: responding.length - scored.length,
        scoredCount: scored.length,
        scanWindow: scanWindow(records),
        ...summarize(scored, attrIndex),
    };
    summary.charts = buildGroupCharts(summary, scored, audits, { idBase, groupTitle, groupText });
    return summary;
}
