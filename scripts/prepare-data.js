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
import { default as domainData } from '../_data/domains.js';

export const DATA_FILE = './public/data/myscangov_homepage_audits.json';

// Files a build job needs from this step (paths relative to the repo root).
export const PREPARED_FILES = [
  'public/data/myscangov_homepage_audits.json',
  'public/data/search.csv',
  'scripts/data/lastscan.json',
  'scripts/data/myscangov_changes.json',
];

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
      fs.writeFileSync(DATA_FILE, JSON.stringify(auditData), 'utf8');
    }
  }

  const domainDataFilled = domainData();
  const olddata = JSON.parse(fs.readFileSync('./scripts/data/lastscan.json'));
  await appendChangelog(domainDataFilled, olddata);

  fs.writeFileSync(
    './public/data/search.csv',
    'domain,agency\n' + domainDataFilled.map((d) => d.urlkey + ',"' + d.name + '"').join('\n')
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
