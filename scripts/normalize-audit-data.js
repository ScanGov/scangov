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
// Runs inside prepare-data.js on every fetch. To apply it to the committed
// data file by hand: node scripts/normalize-audit-data.js
import * as fs from 'fs';
import { isPartial } from './counties.js';

export const NO_CONTENT_STATUS = 995;

const SCORE_FIELDS = [
  'scores', 'botability', 'accessibility', 'usability', 'security',
  'overallPossibleScore', 'overallScoreCount', 'overallScore', 'ari', 'fk',
];

export function normalizeAuditData(records) {
  let reclassified = 0;
  const out = records.map((d) => {
    if (d.status !== 200 || !d.scores || !isPartial(d)) return d;
    reclassified++;
    const copy = { ...d, scannedStatus: d.status, status: NO_CONTENT_STATUS };
    for (const field of SCORE_FIELDS) delete copy[field];
    return copy;
  });
  return { records: out, reclassified };
}

const isMainModule = process.argv[1] && process.argv[1].includes('normalize-audit-data');
if (isMainModule) {
  const file = './public/data/myscangov_homepage_audits.json';
  const { records, reclassified } = normalizeAuditData(JSON.parse(fs.readFileSync(file, 'utf8')));
  fs.writeFileSync(file, JSON.stringify(records), 'utf8');
  console.log(`normalize-audit-data: ${reclassified} records reclassified to status ${NO_CONTENT_STATUS} (${records.length} total)`);
}
