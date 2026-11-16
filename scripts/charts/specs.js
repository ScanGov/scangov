// Spec builders: turn scan data into chart specs for renderChart(). Every
// title names the population and every subtitle names the denominator, so
// the figure explains itself without a caption written by hand.

import { GRADE_BUCKETS } from '../counties.js';
import { humanizeLabel, formatCount, slugify } from './format.js';

const GRADE_SERIES = GRADE_BUCKETS.map(b => ({ key: b.key, short: b.grades.join('–'), label: b.label, color: b.color }));

function bucketize(distribution, total) {
    return GRADE_BUCKETS.map(b => {
        const value = b.grades.reduce((n, g) => n + (distribution[g] || 0), 0);
        return { key: b.key, value, share: total ? value / total : 0 };
    });
}

// Stacked bar: one row per group, segments A / B to C / D to F.
export function gradeDistributionSpec({ id, title, titleHref, subtitle, headingLevel, groups, unit = 'sites', caveat }) {
    return {
        id, type: 'stackedBar', title, titleHref, subtitle, headingLevel, caveat, unit,
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
// A row links the issue page listing the failing sites (f.issueUrl, from
// scripts/issues.js) when there is one, else the check's standard.
export function topFailuresSpec({ id, title, subtitle, headingLevel, failures, respondingCount, unit = 'sites', caveat }) {
    return {
        id, type: 'bar', title, subtitle, headingLevel, caveat,
        valueFormat: 'percent', max: 100,
        labelHeader: 'Check', valueHeader: 'Share failing',
        tableColumns: ['Check', 'Share failing', 'Sites failing'],
        rows: failures.map(f => ({
            key: f.key, label: humanizeLabel(f.label), href: f.issueUrl || f.standardsUrl,
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

// Bars: one domain's overall score and one row per indicator, colored by grade
// band (90 and up success, 70 and up warning, below that danger, as on the
// domain's Pulse page). A row links to the page for that indicator. Indicators
// the site was not graded on are left out; no scores gives no spec.
export function domainScoresSpec({ id = 'domain-scores', title = 'Scores by indicator', subtitle, headingLevel = 2, domain, topics, labels }) {
    if (!domain || domain.status !== 200 || !Number.isFinite(domain.overallScore)) return null;
    const slug = slugify(domain.urlkey);
    const color = (score) => (score >= 90 ? 'success' : score >= 70 ? 'warning' : 'danger');
    const rows = [{ key: 'overall', label: 'Overall', value: domain.overallScore, href: `/profile/${slug}/overall/`, color: color(domain.overallScore) }];
    topics.forEach((key, i) => {
        const score = domain.scores && domain.scores[key] ? domain.scores[key].score : null;
        if (!Number.isFinite(score)) return;
        rows.push({ key, label: labels[i], value: score, href: `/profile/${slug}/details/?attr=${key}`, color: color(score) });
    });
    return {
        id, type: 'bar', title, subtitle, headingLevel,
        valueFormat: 'score', max: 100,
        labelHeader: 'Indicator', valueHeader: 'Score',
        rows,
    };
}

// Pie: the same single-row grade bar as a pie. Takes a stackedBar spec built by
// gradeDistributionSpec (one row) and keeps its title, subtitle and numbers.
export function pieFromGradeBar(spec) {
    if (!spec || spec.type !== 'stackedBar' || !spec.rows || spec.rows.length !== 1) return spec;
    const [row] = spec.rows;
    const byKey = new Map(row.segments.map(seg => [seg.key, seg]));
    return {
        id: spec.id, type: 'pie', title: spec.title, titleHref: spec.titleHref, subtitle: spec.subtitle, headingLevel: spec.headingLevel, caveat: spec.caveat,
        labelHeader: 'Grade band', valueHeader: 'Sites',
        rows: spec.series.map(s => ({ key: s.key, label: s.label, value: byKey.has(s.key) ? byKey.get(s.key).value : 0, color: s.color })),
    };
}

// Pie: sites by group (states, counties, cities, federal, education). Each
// summary is a groupSummaries entry; a slice links to the group's Pulse page.
export function groupsPieSpec({ id, title, subtitle, headingLevel, groups }) {
    return {
        id, type: 'pie', title, subtitle, headingLevel,
        labelHeader: 'Group', valueHeader: 'Sites',
        rows: groups.map(g => ({ key: g.key, label: g.label, value: g.count, href: `/pulse/${g.key}/` })),
    };
}

// Pie: an organization's domains by overall grade band (A, B to C, D to F).
export function orgGradesPieSpec({ id = 'org-grades', title = 'Domains by overall grade', headingLevel = 3, domains }) {
    const scores = (domains || []).map(d => d.overallScore).filter(Number.isFinite);
    const count = (test) => scores.filter(test).length;
    return {
        id, type: 'pie', title, subtitle: `${scores.length} domains`, headingLevel,
        labelHeader: 'Grade band', valueHeader: 'Domains',
        rows: [
            { key: 'A', label: 'A (90 to 100)', value: count(s => s >= 90), color: 'success' },
            { key: 'BC', label: 'B to C (70 to 89)', value: count(s => s >= 70 && s < 90), color: 'warning' },
            { key: 'DF', label: 'D to F (below 70)', value: count(s => s < 70), color: 'danger' },
        ],
    };
}

function mean(values) {
    return values.length ? Math.round(values.reduce((n, v) => n + v, 0) / values.length) : null;
}

// Bars: an organization's average overall score and one average per indicator across
// its responding domains, colored by grade band, each row linking to that view.
export function orgScoresSpec({ id = 'org-scores', title = 'Average scores by indicator', headingLevel = 3, domains, topics, labels, slug }) {
    const responding = (domains || []).filter(d => d.status === 200);
    const color = (score) => (score >= 90 ? 'success' : score >= 70 ? 'warning' : 'danger');
    const rows = [];
    const overall = mean(responding.map(d => d.overallScore).filter(Number.isFinite));
    if (overall !== null) rows.push({ key: 'overall', label: 'Overall', value: overall, href: `/org/${slug}/`, color: color(overall) });
    topics.forEach((key, i) => {
        const avg = mean(responding.map(d => (d.scores && d.scores[key] ? d.scores[key].score : null)).filter(Number.isFinite));
        if (avg !== null) rows.push({ key, label: labels[i], value: avg, href: `/org/${slug}/?attr=${key}`, color: color(avg) });
    });
    if (!rows.length) return null;
    return { id, type: 'bar', title, headingLevel, valueFormat: 'score', max: 100, labelHeader: 'Indicator', valueHeader: 'Average score', rows };
}

// Bars: the checks of one indicator that the most domains in an organization fail.
export function orgFailuresSpec({ id, title, headingLevel = 4, domains, topic, audits, limit = 10 }) {
    const counts = {};
    (domains || []).forEach(d => {
        Object.entries(d[topic] || {}).forEach(([attr, passed]) => { if (!passed) counts[attr] = (counts[attr] || 0) + 1; });
    });
    const attrs = (audits && audits[topic] && audits[topic].attributes) || [];
    const labelFor = (attr) => {
        const found = attrs.find(a => a.key === attr || a.scorekey === attr);
        return humanizeLabel(found ? found.displayName : attr.split('-').join(' '));
    };
    const rows = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
        .map(([attr, value]) => ({ key: attr, label: labelFor(attr), value, href: `https://standards.scangov.org/${attr}` }));
    if (!rows.length) return null;
    return { id, type: 'bar', title, headingLevel, labelHeader: 'Check', valueHeader: 'Domains failing', rows };
}

// Pie: every site by scan status type (active, redirect, inaccessible). Each
// slice links to its group on the status page. `statuses` is statusGroups.
const STATUS_TYPES = [
    { type: 'active', label: 'Scanned', color: 'success' },
    { type: 'redirect', label: 'Redirect', color: 'warning' },
    { type: 'inaccessible', label: 'Inaccessible', color: 'danger' },
];

export function statusTypesPieSpec({ id = 'status-types', title = 'Sites by scan status', subtitle, headingLevel = 2, statuses }) {
    return {
        id, type: 'pie', title, subtitle, headingLevel,
        labelHeader: 'Status type', valueHeader: 'Sites',
        rows: STATUS_TYPES.map(t => ({
            key: t.type,
            label: t.label,
            color: t.color,
            href: `#${t.type}`,
            value: (statuses || []).filter(s => s.type === t.type).reduce((n, s) => n + s.count, 0),
        })),
    };
}

// Bars: sites by status code, leaving out the codes with no sites and the
// successful scan (200), which would dwarf the rest. Labels link to the code's page.
export function statusCodesBarsSpec({ id = 'status-codes', title = 'Sites we could not scan, by status code', subtitle, headingLevel = 2, statuses }) {
    const rows = (statuses || [])
        .filter(s => s.type !== 'active' && s.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(s => ({ key: String(s.code), label: `${s.code} ${s.label}`, href: `/status/${s.code}/`, value: s.count, color: s.type === 'redirect' ? 'warning' : 'danger' }));
    if (!rows.length) return null;
    return { id, type: 'bar', title, subtitle, headingLevel, valueFormat: 'count', labelHeader: 'Status code', valueHeader: 'Sites', rows };
}

// Bars: the share of each rankings group's sites with no grade. `groups` is groupSummaries.
export function statusByGroupSpec({ id = 'status-by-group', title = 'Sites without a grade, by type', subtitle, headingLevel = 2, groups }) {
    const rows = (groups || [])
        .filter(g => g.count > 0)
        .map(g => ({ key: g.key, label: g.label, href: g.hub, value: ((g.count - g.scoredCount) / g.count) * 100, detail: `${g.count - g.scoredCount} of ${g.count} sites` }));
    if (!rows.length) return null;
    const top = Math.max(...rows.map(r => r.value));
    return { id, type: 'bar', title, subtitle, headingLevel, valueFormat: 'percent', max: Math.min(100, Math.max(5, Math.ceil(top / 5) * 5)), labelHeader: 'Group', valueHeader: 'Share without a grade', rows };
}

// Bars for one status code's page: every status code with sites except the successful
// scan (200), with the page's own code in the chart color and the rest muted, so the
// code reads against the others. `total` is every site on the list.
export function statusCodeFocusSpec({ id = 'status-code-focus', title, subtitle, headingLevel = 2, statuses, code }) {
    const rows = (statuses || [])
        .filter(s => s.type !== 'active' && s.count > 0)
        .sort((a, b) => b.count - a.count)
        .map(s => ({ key: String(s.code), label: `${s.code} ${s.label}`, href: String(s.code) === String(code) ? undefined : `/status/${s.code}/`, value: s.count }));
    if (!rows.some(r => r.key === String(code))) return null;
    return { id, type: 'bar', title, subtitle, headingLevel, valueFormat: 'count', labelHeader: 'Status code', valueHeader: 'Sites', emphasis: String(code), rows };
}
