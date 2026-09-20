// The data table twin of every chart, rendered from the same spec so the
// numbers cannot drift from the marks. Closed by default inside <details>;
// the summary is keyboard focusable and announced.

import { esc, formatValue, formatCount } from './format.js';

function cell(text, opts = {}) {
    const cls = opts.num ? ' class="sg-num"' : '';
    return `<td${cls}>${text}</td>`;
}

function rowHeader(row) {
    const label = esc(row.label);
    return `<th scope="row">${row.href ? `<a href="${esc(row.href)}">${label}</a>` : label}</th>`;
}

function headers(columns) {
    return `<tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr>`;
}

function barRows(spec) {
    const columns = spec.tableColumns || [spec.labelHeader || 'Item', spec.valueHeader || 'Value'];
    const body = spec.rows.map(row => {
        const cells = [rowHeader(row), cell(formatValue(row.value, spec.valueFormat), { num: true })];
        if (spec.type === 'benchmarkBar') cells.push(cell(formatValue(row.benchmark, spec.valueFormat), { num: true }));
        if (row.detail) cells.push(cell(esc(row.detail), { num: true }));
        return `<tr>${cells.join('')}</tr>`;
    }).join('');
    return { columns, body };
}

function stackedRows(spec) {
    const columns = spec.tableColumns || [spec.labelHeader || 'Group', ...spec.series.map(s => s.label)];
    const body = spec.rows.map(row => {
        const byKey = new Map(row.segments.map(s => [s.key, s]));
        const cells = spec.series.map(s => {
            const seg = byKey.get(s.key);
            if (!seg) return cell('0', { num: true });
            return cell(`${Math.round(seg.share * 100)}% (${formatCount(seg.value)})`, { num: true });
        });
        return `<tr>${rowHeader(row)}${cells.join('')}</tr>`;
    }).join('');
    return { columns, body };
}

function binRows(spec) {
    const columns = spec.tableColumns || ['Score range', spec.valueHeader || 'Sites'];
    const body = spec.bins.map(bin => `<tr><th scope="row">${bin.from} to ${bin.to}</th>${cell(formatCount(bin.count), { num: true })}</tr>`).join('');
    return { columns, body };
}

export function renderTable(spec) {
    let parts;
    switch (spec.type) {
        case 'stackedBar': parts = stackedRows(spec); break;
        case 'histogram':
        case 'area': parts = binRows(spec); break;
        default: parts = barRows(spec);
    }
    const summary = spec.tableSummary || 'View the data table';
    return `<details class="sg-chart-data"><summary>${esc(summary)}</summary>`
        + `<div class="table-responsive"><table class="table table-sm">`
        + `<caption class="visually-hidden">${esc(spec.title)}</caption>`
        + `<thead>${headers(parts.columns)}</thead><tbody>${parts.body}</tbody></table></div></details>`;
}
