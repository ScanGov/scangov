// Score distribution as vertical columns, one per 10-point bin, in a CSS grid.
// The plot has a fixed height that includes the axis band so it never scrolls.

import { esc, formatCount, niceMax, ratio, fillClass } from './format.js';

export function renderHistogram(spec) {
    const max = Number.isFinite(spec.max) ? spec.max : niceMax(Math.max(1, ...spec.bins.map(b => b.count)));
    const unit = spec.unit ? ` ${esc(spec.unit)}` : '';
    const cols = spec.bins.map((bin, i) => {
        const count = formatCount(bin.count);
        return `<li class="sg-col" style="--i:${i};--r:${ratio(bin.count, max)}" data-tip="${esc(`${bin.from} to ${bin.to}: ${count}${unit ? ' ' + spec.unit : ''}`)}" tabindex="0">`
            + `<span class="sg-col-count" aria-hidden="true">${bin.count ? count : ''}</span>`
            + `<span class="sg-col-fill ${fillClass(spec.color || 'series-1')}" aria-hidden="true"></span>`
            + `<span class="sg-col-label" aria-hidden="true">${bin.from}–${bin.to}</span>`
            + `<span class="visually-hidden">${bin.from} to ${bin.to}: ${count}${unit}</span></li>`;
    }).join('');
    return `<ol class="sg-hist" style="--sg-cols:${spec.bins.length}"${spec.subtitleId ? ` aria-describedby="${spec.subtitleId}"` : ''}>${cols}</ol>`
        + `<p class="sg-axis-title" aria-hidden="true">${esc(spec.axisTitle || 'Score, 0 to 100')}</p>`;
}
