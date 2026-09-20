// Formatting and escaping helpers shared by the chart renderers.

const numberFormat = new Intl.NumberFormat('en-US');

export function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// audits.json display names can carry markup-ish text such as
// "<frame> or <iframe> elements have a title". Strip the brackets for chart
// labels and start with a capital letter.
export function humanizeLabel(label) {
    const text = String(label ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
    return text ? text[0].toUpperCase() + text.slice(1) : '';
}

export function formatValue(value, valueFormat) {
    if (!Number.isFinite(value)) return '';
    switch (valueFormat) {
        case 'percent': return `${Math.round(value)}%`;
        case 'score': return String(Math.round(value));
        default: return numberFormat.format(Math.round(value));
    }
}

export function formatCount(value) {
    return numberFormat.format(Math.round(value));
}

// Round an axis maximum up to a clean number: 1, 2, 5 or 10 times a power of ten.
export function niceMax(max) {
    if (!Number.isFinite(max) || max <= 0) return 1;
    const raw = max / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const ratio = raw / mag;
    const step = mag * (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10);
    return Math.ceil(max / step) * step;
}

// Ratio for CSS custom properties: clamped to 0..1, four decimals, no trailing noise.
export function ratio(value, max) {
    if (!Number.isFinite(value) || !max) return '0';
    const r = Math.min(Math.max(value / max, 0), 1);
    return String(Math.round(r * 10000) / 10000);
}

// Class that paints a mark. Token names come from the spec, never hex values:
// series-1 and muted are chart tokens; success, warning, danger and
// inaccessible are the site's grade colors.
const FILL_TOKENS = new Set(['series-1', 'muted', 'track', 'success', 'warning', 'danger', 'inaccessible']);
export function fillClass(color) {
    const token = FILL_TOKENS.has(color) ? color : 'series-1';
    return `sg-fill-${token}`;
}

export function clampHeading(level) {
    const n = parseInt(level, 10);
    if (!Number.isFinite(n)) return 3;
    return Math.min(Math.max(n, 2), 4);
}

// Eleventy's slugify filter (sindresorhus/slugify) turns "lacounty.gov" into
// "lacounty-gov"; profile links elsewhere on the site rely on that shape.
export function slugify(text) {
    return String(text ?? '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
