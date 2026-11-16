// A pie for a part-to-whole where the slices add up to the whole (100%): sites
// by group, sites by grade band. Plain SVG, no script. Each slice has a title
// for the hover tip, the legend names every slice with its count and share, and
// the data table twin (table.js) carries the same numbers.
//
// Colors: a token (success, warning, danger, inaccessible, series-1, muted), or,
// with none, a step of the chart blue from dark to light so a pie of unrelated
// groups does not need a rainbow. A slice's label always sits in the legend, so
// color never carries the meaning alone.

import { esc, formatCount } from './format.js';

const TOKEN_FILL = {
    'series-1': 'var(--sg-chart-series-1)',
    muted: 'var(--sg-chart-muted)',
    success: 'var(--bs-success)',
    warning: 'var(--bs-warning)',
    danger: 'var(--bs-danger)',
    inaccessible: 'var(--bs-inaccessible)',
};
const SHADES = [100, 78, 58, 42, 28, 18];

export function sliceFill(row, index) {
    if (row.color && TOKEN_FILL[row.color]) return TOKEN_FILL[row.color];
    const pct = SHADES[index % SHADES.length];
    return `color-mix(in oklab, var(--sg-chart-series-1) ${pct}%, var(--bs-body-bg))`;
}

function point(angle) {
    return `${(Math.sin(angle)).toFixed(5)} ${(-Math.cos(angle)).toFixed(5)}`;
}

function percent(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
}

export function renderPie(spec) {
    const total = spec.rows.reduce((n, r) => n + (Number.isFinite(r.value) ? r.value : 0), 0);
    let start = 0;
    const slices = spec.rows.map((row, i) => {
        const value = Number.isFinite(row.value) ? row.value : 0;
        if (!value || !total) return '';
        const end = start + (value / total) * Math.PI * 2;
        const tip = `${esc(row.label)}: ${formatCount(value)} (${percent(value, total)}%)`;
        const style = `fill:${sliceFill(row, i)}`;
        let shape;
        if (value === total) {
            shape = `<circle r="1" style="${style}"><title>${tip}</title></circle>`;
        } else {
            const large = end - start > Math.PI ? 1 : 0;
            shape = `<path d="M0 0 L${point(start)} A1 1 0 ${large} 1 ${point(end)} Z" style="${style}"><title>${tip}</title></path>`;
        }
        start = end;
        return shape;
    }).join('');

    const legend = spec.rows.map((row, i) => {
        const value = Number.isFinite(row.value) ? row.value : 0;
        const label = row.href ? `<a href="${esc(row.href)}">${esc(row.label)}</a>` : esc(row.label);
        return `<li><span class="sg-swatch" style="background:${sliceFill(row, i)}" aria-hidden="true"></span>${label}: ${formatCount(value)} (${percent(value, total)}%)</li>`;
    }).join('');

    const summary = spec.rows.map(r => `${r.label} ${percent(r.value, total)}%`).join(', ');
    return `<div class="d-flex flex-wrap align-items-center gap-4">`
        + `<svg viewBox="-1.02 -1.02 2.04 2.04" role="img" aria-labelledby="${esc(spec.id)}-title" aria-describedby="${esc(spec.id)}-pie-text" focusable="false" style="width:12rem;height:12rem;flex:none" stroke="var(--bs-body-bg)" stroke-width=".015">${slices}</svg>`
        + `<span class="visually-hidden" id="${esc(spec.id)}-pie-text">${esc(summary)}</span>`
        + `<ul class="sg-legend" style="flex-direction:column;margin:0">${legend}</ul>`
        + `</div>`;
}
