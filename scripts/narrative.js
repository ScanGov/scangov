// Sentences for Pulse, generated from summaries so the prose stays true after
// every scan. Each function states numbers and the standard behind them and
// nothing more: no intensifiers, no conclusions the data does not carry.
// Registered as Nunjucks filters in eleventy.config.js.

import { humanizeLabel } from './charts/format.js';

const fmt = new Intl.NumberFormat('en-US');
const n = v => fmt.format(v);
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

function gradeCounts(summary, topic) {
    const d = summary.gradeDistribution[topic];
    return { a: d.A, bc: d.B + d.C, df: d.D + d.F, total: summary.scoredCount };
}

// "Of 4,105 fully scanned sites, 31% (1,270) earn an A for overall score,
// 60% (2,463) a B or C, and 9% (372) a D or F. The average score is 79."
export function gradeSentence(summary, topicName = 'overall score', topic = 'overall') {
    const g = gradeCounts(summary, topic);
    return `Of ${n(g.total)} fully scanned sites, ${pct(g.a, g.total)}% (${n(g.a)}) earn an A for ${topicName}, `
        + `${pct(g.bc, g.total)}% (${n(g.bc)}) a B or C, and ${pct(g.df, g.total)}% (${n(g.df)}) a D or F. `
        + `The average score is ${summary.averages[topic]}.`;
}

// "State sites average 85, the highest of the five groups; county sites
// average 76, the lowest. The gap is 9 points."
export function groupsSentence(groups, topic = 'overall') {
    const noun = g => `${g.singular || g.label.toLowerCase()} sites`;
    const ranked = groups.filter(g => g.scoredCount > 0).map(g => ({ noun: noun(g), avg: g.averages[topic] })).sort((a, b) => b.avg - a.avg);
    if (ranked.length < 2) return '';
    const top = ranked[0], bottom = ranked[ranked.length - 1];
    const words = ['', 'one', 'two', 'three', 'four', 'five', 'six'];
    const cap = s => s[0].toUpperCase() + s.slice(1);
    return `${cap(top.noun)} average ${top.avg}, the highest of the ${words[ranked.length] || ranked.length} groups; `
        + `${bottom.noun} average ${bottom.avg}, the lowest. The gap is ${top.avg - bottom.avg} points.`;
}

// "Every group scores lowest on usability, and every group scores highest on security."
export function indicatorPatternSentence(groups, audits) {
    const topics = ['accessibility', 'botability', 'security', 'usability'];
    const label = t => ((audits[t] && audits[t].displayName) || t).toLowerCase();
    const scored = groups.filter(g => g.scoredCount > 0);
    if (!scored.length) return '';
    const lows = new Map(), highs = new Map();
    for (const g of scored) {
        const sorted = [...topics].sort((a, b) => g.averages[a] - g.averages[b]);
        lows.set(sorted[0], (lows.get(sorted[0]) || 0) + 1);
        highs.set(sorted[3], (highs.get(sorted[3]) || 0) + 1);
    }
    const [lowTopic, lowCount] = [...lows.entries()].sort((a, b) => b[1] - a[1])[0];
    const [highTopic, highCount] = [...highs.entries()].sort((a, b) => b[1] - a[1])[0];
    // "every group scores" but "3 of 5 groups score"
    const clause = (c, what) => (c === scored.length ? `every group scores ${what}` : `${c} of ${scored.length} groups score ${what}`);
    const first = clause(lowCount, `lowest on ${label(lowTopic)}`);
    return `${first[0].toUpperCase()}${first.slice(1)}, and ${clause(highCount, `highest on ${label(highTopic)}`)}.`;
}

// "The most common accessibility failure is Links have a discernible name:
// 48% (1,970 of 4,105 sites) fail it."
export function topFailureSentence(summary, topic, topicName) {
    const f = summary.topFailures[topic] && summary.topFailures[topic][0];
    if (!f) return '';
    return `The most common ${topicName} failure is ${humanizeLabel(f.label)}: ${pct(f.failCount, summary.scoredCount)}% (${n(f.failCount)} of ${n(summary.scoredCount)} sites) fail it.`;
}
