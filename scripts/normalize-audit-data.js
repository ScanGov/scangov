// Site-wide rule (2026-09-20): a site we could not fully scan is not graded.
//
// The auditor records status 200 for some sites that answered the request
// but returned no page content (a bot-protection layer serving an empty or
// interstitial page). Their content checks were never run, so their scores
// rest on a fraction of the checks and read higher than a full scan would.
// This step reclassifies those records to status 995 ("No page content",
// defined in the data repo's status.json) and drops their scores, so every
// template, average, ranking and status page treats them exactly like any
// other site the scanner could not read. The original status is kept in
// `scannedStatus` for reference.
//
// One record per domain (2026-11-08): the auditor's domain list can carry
// several entries that resolve to the same registrable domain (five campus
// subdomains in the education list landed on erau.edu and iavalley.edu). The
// site keys everything by urlkey, so those records rendered to one profile
// URL (the last shard to write won), listed that URL repeatedly in the
// sitemap, and failed check-build-output.js. dedupeDomains() keeps the newest
// scan of each domain and runs before the status rule.
//
// Runs inside prepare-data.js on every fetch. To apply it to the committed
// data file by hand: node scripts/normalize-audit-data.js
import { pathToFileURL } from 'node:url';
import * as fs from 'fs';
import { isPartial } from './counties.js';

export const NO_CONTENT_STATUS = 995;

// Per-topic flat result objects are listed by name; a topic absent from a
// record is simply not there to delete.
const SCORE_FIELDS = [
  'scores', 'botability', 'accessibility', 'usability', 'security', 'readability',
  'overallPossibleScore', 'overallScoreCount', 'overallScore', 'ari', 'fk',
  // Counts behind the reading-level verdict (words, sentences, source, skipped),
  // added to the payload in Oct 2026 alongside ari and fk.
  'readabilityInfo',
];

// Collapse records that share a urlkey to the one with the newest scan time.
// Order is preserved (the sharded build slices the list by position), and
// records without a urlkey pass through untouched. Returns the dropped records
// so the caller can log them.
export function dedupeDomains(records) {
  const byKey = new Map();
  const out = [];
  const dropped = [];
  for (const d of records) {
    if (!d.urlkey) {
      out.push(d);
      continue;
    }
    const kept = byKey.get(d.urlkey);
    if (!kept) {
      byKey.set(d.urlkey, d);
      out.push(d);
      continue;
    }
    if ((d.time || 0) > (kept.time || 0)) {
      out[out.indexOf(kept)] = d;
      byKey.set(d.urlkey, d);
      dropped.push(kept);
    } else {
      dropped.push(d);
    }
  }
  return { records: out, dropped };
}

export function normalizeAuditData(records) {
  const { records: unique, dropped: deduped } = dedupeDomains(records);
  let reclassified = 0;
  const out = unique.map((d) => {
    if (d.status !== 200 || !d.scores || !isPartial(d)) return d;
    reclassified++;
    const copy = { ...d, scannedStatus: d.status, status: NO_CONTENT_STATUS };
    for (const field of SCORE_FIELDS) delete copy[field];
    return copy;
  });
  return { records: out, reclassified, deduped };
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  const file = './public/data/myscangov_homepage_audits.json';
  const { records, reclassified, deduped } = normalizeAuditData(JSON.parse(fs.readFileSync(file, 'utf8')));
  fs.writeFileSync(file, JSON.stringify(records), 'utf8');
  for (const d of deduped) console.log(`normalize-audit-data: dropped duplicate ${d.urlkey} (${d.name}, scanned ${new Date(d.time).toISOString().slice(0, 10)})`);
  console.log(`normalize-audit-data: ${deduped.length} duplicate records dropped, ${reclassified} records reclassified to status ${NO_CONTENT_STATUS} (${records.length} total)`);
}
