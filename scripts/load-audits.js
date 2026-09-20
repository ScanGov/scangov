// audits.json loader for data files that need check names and copy at build
// time. Same rule as _data/dashboard.js: the sibling data repo on the dev
// server, GitHub otherwise. Callers fall back to formatted keys when the file
// is unavailable, so a fetch failure degrades copy rather than the build.
//
// Kept out of the _data files themselves on purpose: Eleventy treats a data
// module with named exports next to its default export as a plain object of
// exports, which breaks pagination over that data.

import * as fs from 'fs';

const AUDITS_URL = 'https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json';
const AUDITS_LOCAL = '../data/standards/audits.json';

let cached = null;

export async function loadAudits() {
    if (cached) return cached;
    try {
        if (process.env.ELEVENTY_RUN_MODE === 'serve' && fs.existsSync(AUDITS_LOCAL)) {
            cached = JSON.parse(fs.readFileSync(AUDITS_LOCAL, 'utf8'));
            return cached;
        }
        const resp = await fetch(AUDITS_URL);
        if (resp.ok) {
            cached = await resp.json();
            return cached;
        }
        console.warn(`load-audits: audits.json fetch returned ${resp.status}`);
    } catch (e) {
        console.warn(`load-audits: audits.json unavailable (${e.message})`);
    }
    return {};
}
