// Build-time chart renderer. renderChart(spec) returns the HTML for one
// <figure>: caption, marks, legend, optional caveat, and the data table twin,
// all from one spec object so nothing is typed twice.
//
// Spec:
//   id            required, unique on the page; prefixes every generated id
//   type          bar | benchmarkBar | stackedBar | histogram | area
//   title         sentence case; names the population ("Texas counties by grade")
//   headingLevel  2..4 (default 3) so the page outline stays in order
//   subtitle      the denominator and units ("218 responding sites, score 0 to 100")
//   caveat        one sentence shown under the marks, next to what it qualifies
//   valueFormat   count | percent | score
//   max           axis maximum (default: 100 for percent and score, a nice number otherwise)
//   rows          bar types: [{ key, label, href, value, benchmark, color, srText, detail }]
//   series        stackedBar: [{ key, short, label, color }] in segment order
//   emphasis      bar types: row key drawn in series-1 while the rest are muted
//   bins          histogram and area: [{ from, to, count }]
//   points        area: [{ label, value }] (the raw values the curve is fitted to)
//   markers       area: [{ label, value }]
//   legend        [{ label, color, shape }] (auto for stackedBar and benchmarkBar)
//   tableColumns  header override for the data table
//
// Colors are token names (series-1, muted, success, warning, danger,
// inaccessible), resolved by CSS custom properties in scangov.css, so charts
// follow the theme without any script.

import { esc, clampHeading, fillClass } from './format.js';
import { renderBarList, renderStackedBars } from './bars.js';
import { renderHistogram } from './histogram.js';
import { renderArea } from './area.js';
import { renderTable } from './table.js';

function renderLegend(items) {
    if (!items || !items.length) return '';
    const li = items.map(item => {
        const shape = item.shape === 'line' ? 'sg-swatch--line' : '';
        const cls = item.status ? `text-bg-${esc(item.color)}` : fillClass(item.color);
        return `<li><span class="sg-swatch ${cls} ${shape}" aria-hidden="true"></span>${esc(item.label)}</li>`;
    }).join('');
    return `<ul class="sg-legend">${li}</ul>`;
}

function autoLegend(spec) {
    if (spec.legend) return spec.legend;
    if (spec.type === 'stackedBar') {
        return spec.series.map(s => ({ label: s.label, color: s.color, status: true }));
    }
    if (spec.type === 'benchmarkBar') {
        return [
            { label: spec.seriesLabel || 'Value', color: 'series-1' },
            { label: spec.benchmarkLabel || 'Comparison', color: 'muted', shape: 'line' },
        ];
    }
    if (spec.type === 'area') {
        return (spec.markers || []).map((m, i) => ({ label: m.label, color: i === 0 ? 'series-1' : 'muted', shape: 'line' }));
    }
    return null;
}

export function renderChart(spec) {
    if (!spec || typeof spec !== 'object') throw new Error('chart: spec object required');
    if (!spec.id) throw new Error('chart: spec.id required');
    if (!spec.title) throw new Error(`chart ${spec.id}: spec.title required`);
    const type = spec.type || 'bar';
    const h = clampHeading(spec.headingLevel);
    const titleId = `${spec.id}-title`;
    const subtitleId = spec.subtitle ? `${spec.id}-sub` : '';
    const withIds = { ...spec, type, subtitleId };

    let marks;
    switch (type) {
        case 'bar':
        case 'benchmarkBar': marks = renderBarList(withIds); break;
        case 'stackedBar': marks = renderStackedBars(withIds); break;
        case 'histogram': marks = renderHistogram(withIds); break;
        case 'area': marks = renderArea(withIds); break;
        default: throw new Error(`chart ${spec.id}: unknown type ${type}`);
    }

    const caption = `<figcaption><h${h} class="sg-chart-title" id="${titleId}">${esc(spec.title)}</h${h}>`
        + (spec.subtitle ? `<p class="sg-chart-sub" id="${subtitleId}">${esc(spec.subtitle)}</p>` : '')
        + `</figcaption>`;
    const legend = renderLegend(autoLegend(withIds));
    const caveat = spec.caveat ? `<p class="sg-chart-caveat">${esc(spec.caveat)}</p>` : '';
    const table = renderTable(withIds);

    return `<figure class="sg-chart sg-chart--${type}" id="${esc(spec.id)}" aria-labelledby="${titleId}">`
        + caption + marks + legend + caveat + table + `</figure>`;
}
