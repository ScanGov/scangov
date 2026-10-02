/**
 * Which homepages still carry pre-fix robots.txt and sitemap data.
 *
 * Read-only. Reads the committed export, writes nothing, touches no database.
 * See notes/plans/17-auditor-robots-sitemap-checks.md.
 *
 * Every record written by the fixed augmentsitedata carries robotsFile.checkedAt.
 * A record with no robotsFile, or one checked before the deploy, has not been
 * re-audited yet. Because these values only change when augmentsitedata runs, and
 * that only runs off a completed page audit, the list is exactly "domains whose
 * homepage has not been audited since the fix shipped".
 *
 *   node scripts/robots-sitemap-staleness.js               # summary
 *   node scripts/robots-sitemap-staleness.js --list        # domains, one per line
 *   node scripts/robots-sitemap-staleness.js --list --counties
 *   node scripts/robots-sitemap-staleness.js --deploy 2026-09-27
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const EXPORT_FILE = './public/data/myscangov_homepage_audits.json';
const COUNTY_CSV = path.resolve('../auditor/scripts/data/county_domains.csv');

// The robots and sitemap fix went out on this date. Records checked before it are stale.
const DEFAULT_DEPLOY = '2026-09-27';

const args = process.argv.slice(2);
const listMode = args.includes('--list');
const countiesOnly = args.includes('--counties');
const deployArg = args[args.indexOf('--deploy') + 1];
const deployTime = new Date(args.includes('--deploy') ? deployArg : DEFAULT_DEPLOY).getTime();

function countyDomains() {
    try {
        const rows = parse(fs.readFileSync(COUNTY_CSV, 'utf8'), { skip_empty_lines: true });
        return new Set(rows.map(row => {
            let value = (row[0] || '').trim().toLowerCase();
            if (value.startsWith('http')) value = new URL(value).hostname;
            return value.replace(/^www\./, '');
        }).filter(v => v && v.includes('.')));
    } catch (e) {
        console.warn(`Could not read ${COUNTY_CSV}: ${e.message}. County counts will be 0.`);
        return new Set();
    }
}

const counties = countyDomains();
const domainOf = r => (r.urlkey || r.key || '').toLowerCase().replace(/^www\./, '');
const isCounty = r => counties.has(domainOf(r));
const botability = r => r.botability || {};

function isStale(record) {
    const checkedAt = record.robotsFile?.checkedAt;
    return !checkedAt || checkedAt < deployTime;
}

// Each bug leaves a different fingerprint, so the remainder can be triaged rather
// than just counted.
function fingerprint(record) {
    const bot = botability(record);
    if (['status', 'xml', 'sitemap-robots'].every(k => !(k in bot))) return 'robots.txt was blocked, no sitemap keys at all';
    if (bot['sitemap-robots'] === true && bot.status === false) return 'declared a sitemap, recorded as missing (URL resolution bug)';
    if ('valid' in bot) return 'Lighthouse-derived robots validity, now replaced';
    return 'other';
}

const records = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf8'));
const scanned = records.filter(r => r.status === 200 && r.scores);
const unreachable = records.length - scanned.length;

let pool = scanned;
if (countiesOnly) pool = pool.filter(isCounty);

const stale = pool.filter(isStale);
const fresh = pool.length - stale.length;

if (listMode) {
    for (const record of stale) console.log(domainOf(record));
    process.exit(0);
}

console.log(`Export:            ${EXPORT_FILE}`);
console.log(`Deploy cutoff:     ${new Date(deployTime).toISOString().slice(0, 10)}`);
console.log(`Records:           ${records.length} (${unreachable} unreachable or unscored, excluded)`);
console.log(`Pool:              ${pool.length}${countiesOnly ? ' counties' : ' fully scanned'}`);
console.log('');
console.log(`Re-audited:        ${fresh}`);
console.log(`Still stale:       ${stale.length}  (${((stale.length / (pool.length || 1)) * 100).toFixed(1)}%)`);
console.log(`  of those, counties: ${stale.filter(isCounty).length}`);

const groups = {};
for (const record of stale) {
    const key = fingerprint(record);
    groups[key] = groups[key] || { total: 0, counties: 0 };
    groups[key].total++;
    if (isCounty(record)) groups[key].counties++;
}
console.log('\nWhat the stale records are carrying:');
for (const [label, counts] of Object.entries(groups).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`  ${String(counts.total).padStart(5)}  (${String(counts.counties).padStart(4)} counties)  ${label}`);
}

if (stale.length === 0) {
    console.log('\nNothing stale. The fix has reached every scanned homepage.');
} else {
    console.log('\nRe-run against a fresh export to watch this fall. Pipe --list into a');
    console.log('rescan walker only after a domain has gone 24 hours since its last');
    console.log('domain-level scan, or augmentsitedata will not re-run for it.');
}
