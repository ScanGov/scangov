// Spec builders: turn scan data into chart specs for renderChart(). Every
// title names the population and every subtitle names the denominator, so
// the figure explains itself without a caption written by hand.

import { GRADE_BUCKETS } from '../counties.js';
import { humanizeLabel, formatCount } from './format.js';

const GRADE_SERIES = GRADE_BUCKETS.map(b => ({ key: b.key, short: b.grades.join('–'), label: b.label, color: b.color }));

function bucketize(distribution, total) {
    return GRADE_BUCKETS.map(b => {
        const value = b.grades.reduce((n, g) => n + (distribution[g] || 0), 0);
        return { key: b.key, value, share: total ? value / total : 0 };
    });
}

// Stacked bar: one row per group, segments A / B to C / D to F.
export function gradeDistributionSpec({ id, title, subtitle, headingLevel, groups, unit = 'sites', caveat }) {
    return {
        id, type: 'stackedBar', title, subtitle, headingLevel, caveat, unit,
        series: GRADE_SERIES,
        labelHeader: 'Group',
        rows: groups.map(g => ({ key: g.key, label: g.label, href: g.href, segments: bucketize(g.distribution, g.total) })),
    };
}

// Benchmark bars: one row per topic, the group's average against a comparison average.
export function topicAveragesSpec({ id, title, subtitle, headingLevel, topics, averages, benchmarks, seriesLabel, benchmarkLabel, hrefFor, caveat }) {
    return {
        id, type: 'benchmarkBar', title, subtitle, headingLevel, caveat,
        valueFormat: 'score', max: 100,
        seriesLabel, benchmarkLabel,
        labelHeader: 'Indicator', valueHeader: `${seriesLabel} average`,
        tableColumns: ['Indicator', `${seriesLabel} average`, `${benchmarkLabel} average`],
        rows: topics.map(t => ({
            key: t.key, label: t.label, href: hrefFor ? hrefFor(t.key) : undefined,
            value: averages[t.key], benchmark: benchmarks[t.key],
        })),
    };
}

// Bars: the checks a group fails most often, as a share of responding sites.
export function topFailuresSpec({ id, title, subtitle, headingLevel, failures, respondingCount, unit = 'sites', caveat }) {
    return {
        id, type: 'bar', title, subtitle, headingLevel, caveat,
        valueFormat: 'percent', max: 100,
        labelHeader: 'Check', valueHeader: 'Share failing',
        tableColumns: ['Check', 'Share failing', 'Sites failing'],
        rows: failures.map(f => ({
            key: f.key, label: humanizeLabel(f.label), href: f.standardsUrl,
            value: f.share * 100,
            srText: `(${formatCount(f.failCount)} of ${formatCount(respondingCount)} ${unit})`,
            detail: formatCount(f.failCount),
        })),
    };
}

export function histogramSpec({ id, title, subtitle, headingLevel, bins, unit = 'sites', caveat }) {
    return { id, type: 'histogram', title, subtitle, headingLevel, caveat, bins, unit, valueHeader: 'Sites' };
}

export function areaSpec({ id, title, subtitle, headingLevel, points, bins, markers, caveat }) {
    return { id, type: 'area', title, subtitle, headingLevel, caveat, points, bins, markers, max: 100, valueHeader: 'Sites' };
}

// Bars: groups ranked by average, labels linking to each group's page.
export function rankedGroupsSpec({ id, title, subtitle, headingLevel, groups, emphasis, valueHeader = 'Average score', labelHeader = 'Group', caveat }) {
    return {
        id, type: 'bar', title, subtitle, headingLevel, caveat, emphasis,
        valueFormat: 'score', max: 100, labelHeader, valueHeader,
        rows: groups.map(g => ({ key: g.key, label: g.label, href: g.href, value: g.value, detail: g.detail })),
    };
}
