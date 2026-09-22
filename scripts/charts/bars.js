// Horizontal bars as an HTML list: label, bar, value per row. Labels reflow,
// respond to text zoom and can be links; the bar is a CSS-sized span whose
// width is calc((100% - value room) * --r), so the value label always fits.
//
// Types: bar (one series), benchmarkBar (bar plus a tick for a comparison
// value) and stackedBar (part-to-whole segments per row).

import { esc, formatValue, niceMax, ratio, fillClass } from './format.js';

function axisMax(spec) {
    if (Number.isFinite(spec.max)) return spec.max;
    if (spec.valueFormat === 'percent' || spec.valueFormat === 'score') return 100;
    const values = spec.rows.flatMap(r => [r.value, r.benchmark]).filter(Number.isFinite);
    return niceMax(Math.max(0, ...values));
}

// Room reserved at the right of every bar for its value label, in ch units.
function valueRoom(spec) {
    const longest = spec.rows.reduce((n, r) => Math.max(n, formatValue(r.value, spec.valueFormat).length), 1);
    return `${longest + 2}ch`;
}

function rowColor(spec, row) {
    if (row.color) return row.color;
    if (spec.emphasis !== undefined && spec.emphasis !== null) return row.key === spec.emphasis ? 'series-1' : 'muted';
    return 'series-1';
}

function labelHtml(row) {
    const label = esc(row.label);
    return row.href ? `<a href="${esc(row.href)}">${label}</a>` : label;
}

export function renderBarList(spec) {
    const max = axisMax(spec);
    const items = spec.rows.map((row, i) => {
        const value = formatValue(row.value, spec.valueFormat);
        const sr = row.srText ? `<span class="visually-hidden"> ${esc(row.srText)}</span>` : '';
        let bench = '';
        let benchLabel = '';
        if (spec.type === 'benchmarkBar' && Number.isFinite(row.benchmark)) {
            benchLabel = `${spec.benchmarkLabel || 'Comparison'}: ${formatValue(row.benchmark, spec.valueFormat)}`;
            bench = `<span class="sg-bench" style="--b:${ratio(row.benchmark, max)}"><span class="visually-hidden">${esc(benchLabel)}</span></span>`;
        }
        // Hover and focus tip: label, value, the screen-reader detail, and the benchmark.
        const tip = [`${row.label}: ${value}`, row.srText, benchLabel].filter(Boolean).join(' · ');
        return `<li class="sg-row" style="--i:${i};--r:${ratio(row.value, max)}">`
            + `<span class="sg-label">${labelHtml(row)}</span>`
            + `<span class="sg-plot" data-tip="${esc(tip)}" tabindex="0"><span class="sg-fill ${fillClass(rowColor(spec, row))}" aria-hidden="true"></span>`
            + `<span class="sg-value">${value}</span>${sr}${bench}</span></li>`;
    }).join('');
    return `<ol class="sg-bars" style="--sg-value-room:${valueRoom(spec)}"${spec.subtitleId ? ` aria-describedby="${spec.subtitleId}"` : ''}>${items}</ol>`;
}

export function renderStackedBars(spec) {
    const byKey = new Map(spec.series.map(s => [s.key, s]));
    const items = spec.rows.map((row, i) => {
        const segments = row.segments.filter(seg => seg.share > 0).map(seg => {
            const series = byKey.get(seg.key) || { label: seg.key, color: 'series-1' };
            const pct = Math.round(seg.share * 100);
            const inline = seg.share >= 0.12 ? `<span class="sg-seg-label" aria-hidden="true">${esc(series.short || series.key)} ${pct}%</span>` : '';
            const detail = `${series.label}: ${pct}% (${formatValue(seg.value, 'count')}${spec.unit ? ' ' + spec.unit : ''})`;
            const sr = `<span class="visually-hidden">${esc(detail)}</span>`;
            return `<span class="sg-seg text-bg-${esc(series.color)}" style="--r:${ratio(seg.share, 1)}" data-tip="${esc(`${row.label} · ${detail}`)}" tabindex="0">${inline}${sr}</span>`;
        }).join('');
        return `<li class="sg-row" style="--i:${i}"><span class="sg-label">${labelHtml(row)}</span><span class="sg-plot sg-stack">${segments}</span></li>`;
    }).join('');
    return `<ol class="sg-bars sg-bars--stacked"${spec.subtitleId ? ` aria-describedby="${spec.subtitleId}"` : ''}>${items}</ol>`;
}
