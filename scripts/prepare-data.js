// Data preparation that must happen exactly once per build, before any Eleventy
// process starts: refresh the audit data file from the auditor, append the
// changelog, write search.csv. The single-process `npm run build` runs this from
// the eleventy.before hook; the sharded deploy workflow runs it as its own job and
// hands the resulting files to every build job, which set SKIP_DATA_PREP=1.
//
// Usage: node scripts/prepare-data.js
import * as fs from 'fs';
import { fetchAuditorData } from './fetch-auditor-data.js';
import { appendChangelog } from './changelog.js';
import { normalizeAuditData } from './normalize-audit-data.js';
import { default as domainData } from '../_data/domains.js';

export const DATA_FILE = './public/data/myscangov_homepage_audits.json';

// Files a build job needs from this step (paths relative to the repo root).
export const PREPARED_FILES = [
  'public/data/myscangov_homepage_audits.json',
  'public/data/updated_time',
  'public/data/search.csv',
  'scripts/data/lastscan.json',
  'scripts/data/myscangov_changes.json',
];

// The homepages payload carries no timestamp of its own, so the last-scan
// date shown on every page (via _data/updates.js and _data/updatedTime.js) is
// the newest record time in the full data file. Reads the file directly
// because domains.js truncates the list on the dev server.
export function writeUpdatedTime() {
  const records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const latest = records.reduce((max, d) => (Number.isFinite(d.time) && d.time > max ? d.time : max), 0);
  if (latest > 0) fs.writeFileSync('./public/data/updated_time', String(latest));
  return latest;
}

export async function prepareData({ serve = false } = {}) {
  // In serve mode reuse the cached data file when there is one.
  if (!serve || !fs.existsSync(DATA_FILE)) {
    const auditData = await fetchAuditorData();
    if (auditData === null) {
      if (fs.existsSync(DATA_FILE)) {
        console.warn('\n⚠ New audit data failed validation. Building with previous data.\n');
      } else {
        throw new Error('Audit data failed validation and no previous data file exists. Cannot build.');
      }
    } else {
      // Sites that returned no page content are not graded (see normalize-audit-data.js).
      const { records, reclassified } = normalizeAuditData(auditData);
      console.log(`prepare-data: ${reclassified} sites returned no page content and are recorded as status 995`);
      fs.writeFileSync(DATA_FILE, JSON.stringify(records), 'utf8');
    }
  }
  writeUpdatedTime();

  const domainDataFilled = domainData();
  const olddata = JSON.parse(fs.readFileSync('./scripts/data/lastscan.json'));
  await appendChangelog(domainDataFilled, olddata);

  // domain,agency are the original two columns; score,status are appended so the
  // search page can render grades without a second fetch. Agency stays quoted (3k+
  // names contain a comma) and the new columns go last, so anything reading only
  // the first two columns keeps working.
  const csvAgency = (name) => '"' + String(name ?? '').replaceAll('"', '""') + '"';
  fs.writeFileSync(
    './public/data/search.csv',
    'domain,agency,score,status\n' +
      domainDataFilled
        .map((d) => [d.urlkey, csvAgency(d.name), d.overallScore ?? '', d.status ?? ''].join(','))
        .join('\n')
  );
  console.log(`prepare-data: ${domainDataFilled.length} domains ready`);
}

const isMainModule = process.argv[1] && process.argv[1].includes('prepare-data');
if (isMainModule) {
  try {
    await prepareData();
  } catch (error) {
    console.error('prepare-data:', error.message);
    process.exit(1);
  }
}
