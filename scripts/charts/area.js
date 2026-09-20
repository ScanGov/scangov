// Smoothed score distribution as a single SVG path (a kernel density estimate),
// the one form here that CSS cannot draw. The SVG carries no text: axis labels
// and the average marker label are HTML beneath it, so text zoom and reflow
// behave, and the data table twin uses the same 10-point bins as the histogram.

import { esc, ratio } from './format.js';

const W = 1000;
const H = 300;
const PAD = 8;

function gaussian(x) {
    return Math.exp(-0.5 * x * x);
}

// Bandwidth: Silverman's rule of thumb, floored so a tight cluster still
// draws a visible hump and capped so a small state is not smeared flat.
function bandwidth(values) {
    const n = values.length;
    if (n < 2) return 6;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1));
    const bw = 1.06 * sd * Math.pow(n, -0.2);
    return Math.min(Math.max(bw, 3), 10);
}

export function densityCurve(values, max = 100, steps = 100) {
    const bw = bandwidth(values);
    const ys = [];
    for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * max;
        let sum = 0;
        for (const v of values) sum += gaussian((x - v) / bw);
        ys.push(sum);
    }
    const peak = Math.max(...ys, 1e-9);
    return ys.map(y => y / peak);
}

export function renderArea(spec) {
    const max = Number.isFinite(spec.max) ? spec.max : 100;
    const values = spec.points.map(p => p.value).filter(Number.isFinite);
    const ys = values.length ? densityCurve(values, max) : [];
    const innerW = W - PAD * 2;
    const innerH = H - PAD * 2;
    const coords = ys.map((y, i) => [PAD + (i / (ys.length - 1)) * innerW, PAD + (1 - y) * innerH]);
    const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const area = coords.length ? `${line}L${(PAD + innerW).toFixed(1)} ${H - PAD}L${PAD} ${H - PAD}Z` : '';
    const markers = (spec.markers || []).filter(m => Number.isFinite(m.value)).map((m, i) => {
        const x = PAD + (m.value / max) * innerW;
        return `<line class="sg-area-marker sg-area-marker--${i}" x1="${x.toFixed(1)}" y1="${PAD}" x2="${x.toFixed(1)}" y2="${H - PAD}" vector-effect="non-scaling-stroke"/>`;
    }).join('');
    const markerLabels = (spec.markers || []).filter(m => Number.isFinite(m.value)).map((m, i) => (
        `<span class="sg-marker-label sg-marker-label--${i}${m.value / max > 0.72 ? ' sg-marker-label--flip' : ''}" style="--x:${ratio(m.value, max)}">${esc(m.label)} ${Math.round(m.value)}</span>`
    )).join('');
    const ticks = [0, 25, 50, 75, 100].map(t => `<span class="sg-tick" style="--x:${ratio(t, max)}">${t}</span>`).join('');
    return `<div class="sg-area" aria-hidden="true">`
        + `<svg class="sg-area-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" focusable="false">`
        + (area ? `<path class="sg-area-fill" d="${area}"/><path class="sg-area-line" d="${line}" vector-effect="non-scaling-stroke"/>` : '')
        + markers + `</svg>`
        + `<div class="sg-area-labels">${markerLabels}</div>`
        + `<div class="sg-axis-row">${ticks}</div>`
        + `<p class="sg-axis-title">${esc(spec.axisTitle || 'Score, 0 to 100')}</p></div>`
        + `<p class="visually-hidden">${esc(spec.srSummary || `Distribution of ${values.length} scores. The data table lists counts by score range.`)}</p>`;
}
