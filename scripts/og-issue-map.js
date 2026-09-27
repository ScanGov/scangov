// Social unfurl images for the issue pages: the national county map from
// _includes/issue-county-map.html rasterized to a 1200x630 PNG at build time,
// one per page that has a map. Same approach as scripts/og-map.js for Pulse:
// the page's SVG fills are CSS custom properties, which a rasterizer cannot
// resolve, so this redraws the same paths with the light theme's literal
// colors (public/css/scangov.css). Runs from the eleventy.after hook in the
// core/single build role; profile shards skip it, and merge-shards carries
// the core shard's output into the deploy.
import { mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import issuePages from '../_data/issuePages.js';

const WIDTH = 1200;
const HEIGHT = 630;

// Light theme values. The pass and track tones are the resolved colors of
// color-mix(in oklab, var(--sg-chart-muted) 30%, #fff) and
// rgba(19, 23, 31, 0.08) on white, so the image matches the page.
const COLORS = {
    background: '#ffffff',
    issue: '#1c5cab',
    pass: '#d3d6db',
    unscanned: '#6c757d',
    unlisted: '#ececee',
    stroke: '#ffffff',
    outline: '#13171f',
};

function pathEl(d, fill, extra = '') {
    return d ? `<path fill="${fill}" stroke="${COLORS.stroke}" stroke-width="0.5" stroke-linejoin="round"${extra} d="${d}"/>` : '';
}

export function buildIssueOgSvg(page) {
    const m = page.map;
    const [vx, vy, vw, vh] = m.viewBox.split(/\s+/).map(Number);
    const scale = Math.min((WIDTH * 0.94) / vw, (HEIGHT * 0.94) / vh);
    const x = (WIDTH - vw * scale) / 2 - vx * scale;
    const y = (HEIGHT - vh * scale) / 2 - vy * scale;
    const failing = m.failing.map(c => c.d).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.background}"/>
<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})">
${pathEl(m.unlistedPath, COLORS.unlisted)}
${pathEl(m.passPath, COLORS.pass)}
${pathEl(m.unscannedPath, COLORS.unscanned)}
${pathEl(m.untestedPath, COLORS.unscanned)}
${pathEl(failing, COLORS.issue)}
<path fill="none" stroke="${COLORS.outline}" stroke-opacity="0.4" stroke-width="0.7" stroke-linejoin="round" d="${m.outlines}"/>
</g>
</svg>`;
}

export async function renderIssueOgMaps(outputDir) {
    const dir = join(outputDir, 'assets', 'img');
    mkdirSync(dir, { recursive: true });
    const written = [];
    for (const page of await issuePages()) {
        if (!page.map || !page.ogImage) continue;
        const file = join(dir, page.ogImage);
        await sharp(Buffer.from(buildIssueOgSvg(page))).png().toFile(file);
        written.push(file);
    }
    return written;
}
