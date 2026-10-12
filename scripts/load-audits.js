// audits.json loader for the `audits` global, the eleventy.config.js filters
// and every data file that needs check names and copy at build time. One
// cached copy per build, so the derived topic list (scripts/topics.js) and
// the templates that index `audits[topic]` always see the same file.
//
// Source, in order:
//   SCANGOV_AUDITS_PATH             a local file, any run mode (one-off builds
//                                   against a data branch or a saved copy)
//   ../data/standards/audits.json   the sibling data checkout, dev server only
//   GitHub main                     otherwise (production builds)
//
// Callers fall back to formatted keys when the file is unavailable, so a
// fetch failure degrades copy rather than the build.
//
// Kept out of the _data files themselves on purpose: Eleventy treats a data
// module with named exports next to its default export as a plain object of
// exports, which breaks pagination over that data.

import * as fs from 'fs';

export const AUDITS_URL = 'https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json';
const AUDITS_LOCAL = '../data/standards/audits.json';

let cached = null;

function localAuditsPath() {
    if (process.env.SCANGOV_AUDITS_PATH) return process.env.SCANGOV_AUDITS_PATH;
    if (process.env.ELEVENTY_RUN_MODE === 'serve' && fs.existsSync(AUDITS_LOCAL)) return AUDITS_LOCAL;
    return null;
}

export async function loadAudits() {
    if (cached) return cached;
    try {
        const local = localAuditsPath();
        if (local) {
            cached = JSON.parse(fs.readFileSync(local, 'utf8'));
            console.log(`load-audits: read ${local}`);
            return cached;
        }
        const resp = await fetch(AUDITS_URL);
        if (resp.ok) {
            cached = await resp.json();
            console.log(`load-audits: got ${AUDITS_URL}`);
            return cached;
        }
        console.warn(`load-audits: audits.json fetch returned ${resp.status}`);
    } catch (e) {
        console.warn(`load-audits: audits.json unavailable (${e.message})`);
    }
    return {};
}
