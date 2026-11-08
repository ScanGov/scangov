// Social unfurl images built from the state map in _includes/report-map.html,
// rasterized to 1200x630 PNGs at build time:
//   pulse-map-og.png   Pulse: each state's own site colored by grade
//   county-map-og.png  county hub: states shaded by average county score
//   edu-map-og.png     education hub: states shaded by average education score
//
// The page's map is inline SVG whose fills are CSS custom properties (and, for
// the shaded maps, color-mix()), which an SVG rasterizer cannot resolve, so
// this redraws the same outlines with the light theme's literal colors
// (public/css/scangov.css), the same grade buckets as the colorVar filter in
// eleventy.config.js, and the same 25% to 100% mix the include computes for a
// sequential scale. Runs from the eleventy.after hook in the core/single build
// role; profile shards skip it.
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { statePaths } from './state-paths.js';
import mapData from '../_data/map.js';
import countyStateMap from '../_data/countyStateMap.js';
import eduStateMap from '../_data/eduStateMap.js';

export const OG_MAP_FILE = 'pulse-map-og.png';
export const COUNTY_OG_MAP_FILE = 'county-map-og.png';
export const EDU_OG_MAP_FILE = 'edu-map-og.png';

const WIDTH = 1200;
const HEIGHT = 630;
// viewBox of the Wikimedia outline used by report-map.html
const MAP_WIDTH = 959;
const MAP_HEIGHT = 593;

// Light theme values of --bs-success, --bs-warning, --bs-danger,
// --bs-inaccessible, --bs-body-bg and --sg-chart-series-1.
const COLORS = {
    success: '#7fb135',
    warning: '#face00',
    danger: '#e41d3d',
    inaccessible: '#6c757d',
    background: '#ffffff',
    series1: '#1c5cab',
};

function gradeColor(score) {
    if (typeof score !== 'number' || !Number.isFinite(score)) return COLORS.inaccessible;
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.warning;
    if (score >= 0) return COLORS.danger;
    return COLORS.inaccessible;
}

// color-mix(in oklab, series-1 pct%, white), as the include paints it.
const hexToRgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => {
    const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
};
function toOklab([r, g, b]) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function fromOklab([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
export function mixOklab(hexA, hexB, pctA) {
    const a = toOklab(hexToRgb(hexA).map(toLinear));
    const b = toOklab(hexToRgb(hexB).map(toLinear));
    const t = pctA / 100;
    return '#' + fromOklab(a.map((v, i) => v * t + b[i] * (1 - t))).map(toSrgb).join('');
}

// Same ramp as report-map.html: 25% at the lowest average, 100% at the highest.
function sequentialColor(score, range) {
    if (typeof score !== 'number' || score < 0) return COLORS.inaccessible;
    const mix = range && range.max > range.min ? 25 + 75 * (score - range.min) / (range.max - range.min) : 100;
    return mixOklab(COLORS.series1, COLORS.background, Math.round(mix));
}

// The interior state borders are only in the Nunjucks include; lift that <g>
// so the raster and the page share one copy of the path data.
function borderPaths() {
    const include = readFileSync(new URL('../_includes/report-map.html', import.meta.url), 'utf8');
    const m = /<g[^>]*class="report-map-borders"[^>]*>([\s\S]*?)<\/g>/.exec(include);
    if (!m) throw new Error('og-map: could not find the border paths in _includes/report-map.html');
    return m[1].replace(/\s+class="[^"]*"/g, '');
}

// items: report-map.html map data (name "State of Texas", status, scores,
// optional range). sequential: shade by magnitude instead of grade bands.
export function buildOgMapSvg(items = mapData(), { key = 'overall', sequential = false } = {}) {
    const byName = new Map(items.map((item) => [item.name, item]));
    const range = sequential && items[0] && items[0].range ? items[0].range[key] : null;
    const scale = Math.min((WIDTH * 0.92) / MAP_WIDTH, (HEIGHT * 0.92) / MAP_HEIGHT);
    const x = (WIDTH - MAP_WIDTH * scale) / 2;
    const y = (HEIGHT - MAP_HEIGHT * scale) / 2;

    const states = statePaths.map((state) => {
        const item = byName.get(state.name);
        const score = item && item.status < 300 && item.status !== 0 ? item.scores[key] : -1;
        const fill = sequential ? sequentialColor(score, range) : gradeColor(score);
        // DC is drawn over Maryland, so it gets the border stroke like the page does.
        const stroke = state.name.includes('District of Columbia') ? ` stroke="${COLORS.background}" stroke-width="1"` : '';
        return `<path fill="${fill}"${stroke} d="${state.path}"/>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.background}"/>
<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})">
${states}
<g fill="none" stroke="${COLORS.background}" stroke-width="1">
${borderPaths()}
</g>
</g>
</svg>`;
}

async function writePng(dir, file, svg) {
    const out = join(dir, file);
    await sharp(Buffer.from(svg)).png().toFile(out);
    return out;
}

// All three images. Returns the written paths.
export async function renderOgMap(outputDir) {
    const dir = join(outputDir, 'assets', 'img');
    mkdirSync(dir, { recursive: true });
    return [
        await writePng(dir, OG_MAP_FILE, buildOgMapSvg()),
        await writePng(dir, COUNTY_OG_MAP_FILE, buildOgMapSvg(await countyStateMap(), { sequential: true })),
        await writePng(dir, EDU_OG_MAP_FILE, buildOgMapSvg(await eduStateMap(), { sequential: true })),
    ];
}
