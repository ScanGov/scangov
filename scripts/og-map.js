// Social unfurl image for the Pulse page: the state-site map from
// _includes/report-map.html rasterized to a 1200x630 PNG at build time.
//
// The page's map is inline SVG whose fills are CSS custom properties, which an
// SVG rasterizer cannot resolve, so this rebuilds the same outlines with the
// light theme's literal colors (public/css/scangov.css) and the same grade
// buckets as the colorVar filter in eleventy.config.js. Runs from the
// eleventy.after hook in the core/single build role; profile shards skip it.
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { statePaths } from './state-paths.js';
import mapData from '../_data/map.js';

export const OG_MAP_FILE = 'pulse-map-og.png';

const WIDTH = 1200;
const HEIGHT = 630;
// viewBox of the Wikimedia outline used by report-map.html
const MAP_WIDTH = 959;
const MAP_HEIGHT = 593;

// Light theme values of --bs-success, --bs-warning, --bs-danger,
// --bs-inaccessible and --bs-body-bg.
const COLORS = {
    success: '#7fb135',
    warning: '#face00',
    danger: '#e41d3d',
    inaccessible: '#6c757d',
    background: '#ffffff',
};

function gradeColor(score) {
    if (typeof score !== 'number' || !Number.isFinite(score)) return COLORS.inaccessible;
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.warning;
    if (score >= 0) return COLORS.danger;
    return COLORS.inaccessible;
}

// The interior state borders are only in the Nunjucks include; lift that <g>
// so the raster and the page share one copy of the path data.
function borderPaths() {
    const include = readFileSync(new URL('../_includes/report-map.html', import.meta.url), 'utf8');
    const m = /<g[^>]*class="report-map-borders"[^>]*>([\s\S]*?)<\/g>/.exec(include);
    if (!m) throw new Error('og-map: could not find the border paths in _includes/report-map.html');
    return m[1].replace(/\s+class="[^"]*"/g, '');
}

export function buildOgMapSvg(items = mapData()) {
    const byName = new Map(items.map((item) => [item.name, item]));
    const scale = Math.min((WIDTH * 0.92) / MAP_WIDTH, (HEIGHT * 0.92) / MAP_HEIGHT);
    const x = (WIDTH - MAP_WIDTH * scale) / 2;
    const y = (HEIGHT - MAP_HEIGHT * scale) / 2;

    const states = statePaths.map((state) => {
        const item = byName.get(state.name);
        const score = item && item.status < 300 ? item.scores.overall : -1;
        // DC is drawn over Maryland, so it gets the border stroke like the page does.
        const stroke = state.name.includes('District of Columbia') ? ` stroke="${COLORS.background}" stroke-width="1"` : '';
        return `<path fill="${gradeColor(score)}"${stroke} d="${state.path}"/>`;
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

export async function renderOgMap(outputDir) {
    const dir = join(outputDir, 'assets', 'img');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, OG_MAP_FILE);
    await sharp(Buffer.from(buildOgMapSvg())).png().toFile(file);
    return file;
}
